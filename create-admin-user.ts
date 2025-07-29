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

async function createAdminUser() {
  console.log('Creating admin user...');
  
  try {
    // Delete any existing admin users first
    await db.delete(users).where(eq(users.role, 'admin'));
    console.log('Deleted existing admin users');
    
    // Import the scrypt-based hash function from auth.ts
    const { scrypt, randomBytes } = await import('crypto');
    const { promisify } = await import('util');
    const scryptAsync = promisify(scrypt);
    
    async function hashPassword(password: string) {
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      return `${buf.toString("hex")}.${salt}`;
    }
    
    const hashedPassword = await hashPassword('admin123');
    
    const adminUser = {
      username: 'nextwaveadmission@gmail.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      agencyName: 'NextWave Admissions',
      country: 'UAE',
      phoneNumber: '+971501234567',
      role: 'admin' as const,
      active: true
    };

    const result = await db.insert(users).values(adminUser).returning();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: nextwaveadmission@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('🎯 Role: admin');
    console.log('✅ Status: active');
    
    return result[0];
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pgConnection.end();
  }
}

// Run the function
createAdminUser();