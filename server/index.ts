import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { VERSION } from "./version";
import path from "path";
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

// 🚨 CRITICAL FIX: Trust proxy MUST be set FIRST for production deployments
app.set("trust proxy", 1);
console.log('✅ Trust proxy enabled for production deployment');

// 🌐 UNIVERSAL CORS CONFIGURATION - Works across ANY production environment
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('🌐 CORS Origin Check:', origin);
    
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) {
      console.log('✅ CORS: No origin - allowing');
      return callback(null, true);
    }
    
    // 1. Environment variable whitelist (highest priority)
    const allowedOriginsEnv = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
    if (allowedOriginsEnv.length > 0 && allowedOriginsEnv.includes(origin)) {
      console.log('✅ CORS: Origin in ALLOWED_ORIGINS env var');
      return callback(null, true);
    }
    
    // 2. Universal patterns for ANY hosting platform
    const allowedPatterns = [
      // Local development (comprehensive)
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/0\.0\.0\.0:\d+$/,
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
      /^http:\/\/172\.16\.\d+\.\d+:\d+$/,
      /^https?:\/\/.*\.local(:\d+)?$/,
      /^https?:\/\/.*\.localhost(:\d+)?$/,
      
      // Replit (all variants)
      /^https:\/\/.*\.replit\.app$/,
      /^https:\/\/.*\.repl\.co$/,
      /^https:\/\/.*\.replit\.dev$/,
      /^https:\/\/.*\.worf\.replit\.dev$/,
      /^https:\/\/.*\.kirk\.replit\.dev$/,
      /^https:\/\/.*\.picard\.replit\.dev$/,
      /^https:\/\/.*\.spock\.replit\.dev$/,
      
      // Major hosting platforms
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.netlify\.app$/,
      /^https:\/\/.*\.herokuapp\.com$/,
      /^https:\/\/.*\.railway\.app$/,
      /^https:\/\/.*\.render\.com$/,
      /^https:\/\/.*\.fly\.dev$/,
      /^https:\/\/.*\.surge\.sh$/,
      /^https:\/\/.*\.firebase\.app$/,
      /^https:\/\/.*\.firebaseapp\.com$/,
      /^https:\/\/.*\.github\.io$/,
      /^https:\/\/.*\.gitpod\.io$/,
      /^https:\/\/.*\.codepen\.io$/,
      /^https:\/\/.*\.codesandbox\.io$/,
      /^https:\/\/.*\.codesandbox\.io$/,
      /^https:\/\/.*\.stackblitz\.io$/,
      
      // AWS/Cloud platforms
      /^https:\/\/.*\.amazonaws\.com$/,
      /^https:\/\/.*\.cloudfront\.net$/,
      /^https:\/\/.*\.azurewebsites\.net$/,
      /^https:\/\/.*\.googleusercontent\.com$/,
      
      // Custom domains (if same-origin serving)
      // This allows any HTTPS domain since API and frontend are served from same origin
    ];
    
    // Check against patterns
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    // If no pattern matches but it's HTTPS and not obviously suspicious, allow it
    // This handles custom domains that serve both frontend and API
    const isSuspicious = origin.includes('localhost') || 
                        origin.includes('127.0.0.1') || 
                        origin.includes('192.168.') ||
                        origin.includes('10.') ||
                        !origin.startsWith('https://');
    
    const finalDecision = isAllowed || (!isSuspicious && origin.startsWith('https://'));
    
    console.log(`${finalDecision ? '✅' : '❌'} CORS: Origin ${origin} - ${finalDecision ? 'allowed' : 'blocked'}`);
    console.log(`  Pattern match: ${isAllowed}, Suspicious: ${isSuspicious}`);
    
    callback(null, finalDecision);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
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
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Server error:", err);
      res.status(status).json({ error: message });
    });

    // Serve static files from public directory (logos, favicon, etc.)
    app.use(express.static(path.resolve(import.meta.dirname, "..", "public")));

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "development") {
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
        log(`🚀 Version: ${JSON.stringify(VERSION)}`);
        
        // Add detailed diagnostics
        log(`Node environment: ${process.env.NODE_ENV}`);
        log(`Database connection: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
        log(`Process ID: ${process.pid}`);
      });
    } catch (err) {
      log(`Error starting server: ${err}`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    // Add a basic error handler for Vercel
    app.use('*', (req, res) => {
      res.status(500).json({ 
        error: 'Server initialization failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        path: req.path 
      });
    });
  }
})();

// Export for Vercel
export default app;
