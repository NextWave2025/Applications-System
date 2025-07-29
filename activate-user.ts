import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { users } from './shared/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pgConnection = postgres(connectionString);
const db = drizzle(pgConnection);

async function activateUser() {
  console.log('Activating user account...');
  
  try {
    // Activate the user account
    const result = await db.update(users)
      .set({ active: true })
      .where(eq(users.username, 'abdulramansagir@gmail.com'))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ User activated successfully!');
      console.log('📧 Email: abdulramansagir@gmail.com');
      console.log('✅ Status: active');
    } else {
      console.log('❌ User not found');
    }
    
    return result[0];
  } catch (error) {
    console.error('❌ Error activating user:', error);
  } finally {
    await pgConnection.end();
  }
}

// Run the function
activateUser();