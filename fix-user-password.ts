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

async function fixUserPassword() {
  console.log('Fixing user password...');
  
  try {
    // Check current user
    const currentUser = await db.select().from(users).where(eq(users.username, 'abdulramansagir@gmail.com'));
    
    if (currentUser.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('Current user:', {
      username: currentUser[0].username,
      active: currentUser[0].active,
      passwordLength: currentUser[0].password?.length
    });
    
    // Create a new scrypt-based password hash for "password123" (common test password)
    const { scrypt, randomBytes } = await import('crypto');
    const { promisify } = await import('util');
    const scryptAsync = promisify(scrypt);
    
    async function hashPassword(password: string) {
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      return `${buf.toString("hex")}.${salt}`;
    }
    
    const newPassword = await hashPassword('password123');
    
    // Update user password
    const result = await db.update(users)
      .set({ 
        password: newPassword,
        active: true
      })
      .where(eq(users.username, 'abdulramansagir@gmail.com'))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ User password updated successfully!');
      console.log('📧 Email: abdulramansagir@gmail.com');
      console.log('🔑 New Password: password123');
      console.log('✅ Status: active');
    }
    
    return result[0];
  } catch (error) {
    console.error('❌ Error fixing user password:', error);
  } finally {
    await pgConnection.end();
  }
}

// Run the function
fixUserPassword();