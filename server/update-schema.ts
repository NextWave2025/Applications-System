import { db } from './db';
import { users } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Script to update the database schema to work with the new user roles
 */
async function updateSchemaWithDefaults() {
  console.log('Updating schema with defaults...');
  
  try {
    // First update all existing users to have the 'agent' role if role is null
    const result = await db.execute(
      sql`UPDATE users SET role = 'agent' WHERE role IS NULL`
    );
    
    console.log('Updated existing users with default role:', result);
    
    // Make sure the active field is added with default true
    try {
      await db.execute(
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE`
      );
      console.log('Added active column to users table');
    } catch (err) {
      console.log('Active column might already exist:', err);
    }
    
    // Make sure the created_at field is added with default now()
    try {
      await db.execute(
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()`
      );
      console.log('Added created_at column to users table');
    } catch (err) {
      console.log('created_at column might already exist:', err);
    }
    
    console.log('Schema update completed successfully');
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

// Run the update function
updateSchemaWithDefaults()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });