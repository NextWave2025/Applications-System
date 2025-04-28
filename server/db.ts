import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon database for WebSocket support (needed for serverless environments)
neonConfig.webSocketConstructor = ws;

// Environment variable validation
function validateEnvironmentVariables() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set in your environment variables. Check your .env file or environment configuration.",
    );
  }
  
  // Optional: Add more validation for other required environment variables
  if (!process.env.SESSION_SECRET) {
    console.warn("Warning: SESSION_SECRET is not set. Using a default value for development, but this is not secure for production.");
  }
}

// Validate environment variables before proceeding
validateEnvironmentVariables();

// Create a database connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // You can customize pool settings for local development if needed
  max: process.env.NODE_ENV === 'production' ? 20 : 10, // More connections for production
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});

// Handle pool errors to prevent application crashes
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Create the Drizzle ORM instance with our schema
export const db = drizzle({ client: pool, schema });

// Export a function to check database connectivity
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
