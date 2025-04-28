import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './shared/schema.js';

async function testConnection() {
  console.log('Testing database connection...');
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required!');
    process.exit(1);
  }

  try {
    console.log('Connecting to PostgreSQL...');
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client, { schema });

    console.log('Connected to database successfully!');
    console.log('Testing universities table...');
    
    const universities = await db.select().from(schema.universities).limit(5);
    console.log(`Found ${universities.length} universities:`);
    universities.forEach(uni => {
      console.log(`- ${uni.name} (${uni.location})`);
    });

    console.log('\nTesting programs table...');
    const programs = await db.select().from(schema.programs).limit(5);
    console.log(`Found ${programs.length} programs:`);
    programs.forEach(program => {
      console.log(`- ${program.name} (${program.degree})`);
    });

    console.log('\nDatabase connection test successful!');
    await client.end();
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

testConnection();