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

async function checkAndFixUser() {
  console.log('Checking user accounts...');
  
  try {
    // Find all users with the email
    const allUsers = await db.select().from(users).where(eq(users.username, 'abdulramansagir@gmail.com'));
    
    console.log(`Found ${allUsers.length} users with this email:`);
    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}: ID=${user.id}, Active=${user.active}, Created=${user.createdAt}`);
    });
    
    if (allUsers.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    // Use the most recent user (highest ID)
    const latestUser = allUsers.sort((a, b) => b.id - a.id)[0];
    console.log(`Using latest user: ID=${latestUser.id}`);
    
    // Create a new scrypt-based password hash
    const { scrypt, randomBytes } = await import('crypto');
    const { promisify } = await import('util');
    const scryptAsync = promisify(scrypt);
    
    async function hashPassword(password: string) {
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      return `${buf.toString("hex")}.${salt}`;
    }
    
    const newPassword = await hashPassword('password123');
    
    // Update the latest user
    const result = await db.update(users)
      .set({ 
        password: newPassword,
        active: true
      })
      .where(eq(users.id, latestUser.id))
      .returning();
    
    // Delete older duplicate users
    if (allUsers.length > 1) {
      const olderUsers = allUsers.filter(u => u.id !== latestUser.id);
      for (const oldUser of olderUsers) {
        await db.delete(users).where(eq(users.id, oldUser.id));
        console.log(`Deleted duplicate user ID=${oldUser.id}`);
      }
    }
    
    if (result.length > 0) {
      console.log('✅ User updated successfully!');
      console.log('📧 Email: abdulramansagir@gmail.com');
      console.log('🔑 Password: password123');
      console.log('✅ Status: active');
      console.log(`🆔 User ID: ${result[0].id}`);
    }
    
    return result[0];
  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await pgConnection.end();
  }
}

checkAndFixUser();