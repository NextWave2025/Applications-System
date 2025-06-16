import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { checkDatabaseConnection } from "./db";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables from .env file
const rootPath = path.resolve(import.meta.dirname, "..");
const envPath = path.join(rootPath, '.env');

try {
  // Check if .env file exists and load it
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    log(`Environment variables loaded from ${envPath}`);
  } else {
    log(`Warning: .env file not found at ${envPath}`);
  }
} catch (error) {
  log(`Error loading environment variables: ${error}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static test file for debugging
app.get('/test', (req, res) => {
  res.sendFile(path.resolve(import.meta.dirname, '..', 'static-test.html'));
});

app.use((req, res, next) => {
  const start = Date.now();
  const routePath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (routePath.startsWith("/api")) {
      let logLine = `${req.method} ${routePath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Server error:", err);
    res.status(status).json({ error: message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Get port from environment variable or use default 5000
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Add detailed error logging and uncaught exception handling
  process.on('uncaughtException', (err) => {
    log(`UNCAUGHT EXCEPTION: ${err.message}`);
    log(err.stack || 'No stack trace available');
    // Don't exit to keep the server running
  });

  process.on('unhandledRejection', (reason, promise) => {
    log(`UNHANDLED REJECTION: ${reason}`);
    log(`Promise: ${promise}`);
    if (reason instanceof Error) {
      log(`Stack: ${reason.stack}`);
    }
    // Don't exit to keep the server running
  });

  try {
    server.listen(port, "0.0.0.0", () => {
      log(`SERVER STARTED SUCCESSFULLY on port ${port}`);
      
      // Add detailed diagnostics
      log(`Node environment: ${process.env.NODE_ENV}`);
      log(`Database connection: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
      log(`Process ID: ${process.pid}`);
    });
  } catch (err) {
    log(`Error starting server: ${err}`);
  }
})();
