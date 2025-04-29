-- Create users table
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
  role TEXT NOT NULL DEFAULT 'agent',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create universities table
CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT NOT NULL
);

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  university_id INTEGER NOT NULL,
  tuition TEXT NOT NULL,
  duration TEXT NOT NULL,
  intake TEXT NOT NULL,
  degree TEXT NOT NULL,
  study_field TEXT NOT NULL,
  requirements JSONB NOT NULL,
  has_scholarship BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT NOT NULL
);

-- Create applications table
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
  status_history JSONB DEFAULT '[]',
  admin_notes TEXT,
  rejection_reason TEXT,
  payment_confirmation BOOLEAN DEFAULT FALSE,
  submitted_to_university_date TIMESTAMP,
  last_action_by INTEGER,
  conditional_offer_terms TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL,
  document_type TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  file_data TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id INTEGER NOT NULL,
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Create session table for express-session with connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Insert a test admin user (password would be hashed in production)
INSERT INTO users (username, password, first_name, last_name, role) 
VALUES ('admin@example.com', 'password', 'Admin', 'User', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert a test agent user 
INSERT INTO users (username, password, first_name, last_name, agency_name, role) 
VALUES ('agent@example.com', 'password', 'Test', 'Agent', 'Test Agency', 'agent')
ON CONFLICT (username) DO NOTHING;