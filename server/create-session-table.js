/**
 * Script to manually create the session table for connect-pg-simple
 */
import postgres from 'postgres';

async function createSessionTable() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Create postgres connection
  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString);

  try {
    // Create the session table with standard schema expected by connect-pg-simple
    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
    `;

    console.log('Session table created successfully');
  } catch (error) {
    console.error('Error creating session table:', error);
  } finally {
    await sql.end();
  }
}

createSessionTable().catch(console.error);