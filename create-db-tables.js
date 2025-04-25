// Using ES modules
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTables() {
  try {
    // We'll create the tables directly since we have the schema defined
    console.log('Creating users table if it does not exist...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        agency_name TEXT,
        country TEXT,
        phone_number TEXT,
        website TEXT,
        role TEXT
      )
    `);

    console.log('Creating applications table if it does not exist...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        program_id INTEGER NOT NULL,
        student_first_name TEXT NOT NULL,
        student_last_name TEXT NOT NULL,
        student_email TEXT NOT NULL,
        student_phone TEXT NOT NULL,
        student_date_of_birth DATE NOT NULL,
        student_nationality TEXT NOT NULL,
        student_gender TEXT NOT NULL,
        highest_qualification TEXT NOT NULL,
        qualification_name TEXT NOT NULL,
        institution_name TEXT NOT NULL,
        graduation_year TEXT NOT NULL,
        cgpa TEXT,
        intake_date TEXT NOT NULL,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Creating documents table if it does not exist...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL,
        document_type TEXT NOT NULL,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables();