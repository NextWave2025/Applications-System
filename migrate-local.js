// Local migration script that doesn't require SSL
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

async function main() {
  console.log('Starting local migration...');
  
  // Get the database URL from environment variables
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('DATABASE_URL is not defined in your .env file');
    process.exit(1);
  }
  
  console.log(`Connecting to database: ${dbUrl.split('@')[1]}`);
  
  // Create a Postgres connection (without SSL for local development)
  const connection = postgres(dbUrl, { 
    ssl: false,
    max: 1 
  });
  
  // Create a Drizzle instance
  const db = drizzle(connection, { schema });
  
  console.log('Applying schema to database...');
  
  try {
    // Apply schema to database
    await db.insert(schema.users).values({
      username: 'admin@example.com',
      password: 'hashed_password_would_go_here',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    }).onConflictDoNothing();
    
    console.log('Created initial admin user');
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await connection.end();
  }
}

main().catch(console.error);