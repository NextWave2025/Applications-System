import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
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
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = {
      username: 'admin@nextwaveadmissions.com',
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
    console.log('📧 Email: admin@nextwaveadmissions.com');
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