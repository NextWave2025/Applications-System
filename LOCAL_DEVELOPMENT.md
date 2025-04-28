# Guide Platform - Local Development Guide

This document provides comprehensive instructions for setting up and running the Guide Platform on your local machine.

## Setting Up Your Local Environment

### Prerequisites

Before beginning, ensure you have installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v14 or higher)

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd guide-platform
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Setup

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Edit the `.env` file with your local database connection details:

```
# Database Connection
DATABASE_URL=postgresql://username:password@localhost:5432/guide_db

# Session Configuration
SESSION_SECRET=your_secret_session_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

Replace `username`, `password` with your PostgreSQL credentials. You'll need to create a database named `guide_db` (or choose another name and update the URL accordingly).

### Step 4: Database Setup

1. Create a PostgreSQL database for the project:

```bash
# Using PostgreSQL command line tools
createdb guide_db

# Or using psql
psql -U postgres
CREATE DATABASE guide_db;
\q
```

2. Run database migrations to set up the schema:

```bash
# This will apply the schema from shared/schema.ts to your database
npm run db:push
```

## Running the Project Locally

### Starting the Development Server

```bash
# On macOS/Linux
npm run dev

# On Windows
set NODE_ENV=development && tsx server/index.ts
```

This will start both the backend Express server and the frontend Vite development server. The application will be available at `http://localhost:5000`.

### Database Management Tools

Since the package.json can't be directly modified, here are the commands you can run manually for database management:

```bash
# Generate migration files
npx drizzle-kit generate:pg

# Push schema changes directly to the database
npx drizzle-kit push

# Open Drizzle Studio to view and manage your database
npx drizzle-kit studio
```

## Cleaning Up the Project for Production

Run the included cleanup script to remove development-specific files:

```bash
# Make script executable (on Unix-based systems)
chmod +x cleanup.sh

# Run the cleanup script
./cleanup.sh
```

## Building for Production

1. Build the project for production:

```bash
npm run build
```

2. Update your `.env` file for production settings:

```
NODE_ENV=production
DATABASE_URL=your_production_database_url
SESSION_SECRET=your_secure_production_secret
PORT=5000  # Or the port specified by your hosting provider
```

3. Start the production server:

```bash
npm run start
```

## Local Development Tips

### Cross-Platform Compatibility

When running on Windows, use the `set` command to set environment variables:

```bash
set NODE_ENV=development && tsx server/index.ts
```

On macOS/Linux, you can use:

```bash
NODE_ENV=development tsx server/index.ts
```

### PostgreSQL Connection Issues

If you encounter PostgreSQL connection issues:

1. Verify that PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo service postgresql status
   
   # Windows
   net start | findstr PostgreSQL
   ```

2. Check that your connection string in `.env` is correct:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/guide_db
   ```
   
3. Ensure your PostgreSQL user has appropriate permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE guide_db TO your_username;
   ```

### Session Secret Security

For development, you can use any string as the `SESSION_SECRET`. In production, use a strong random string:

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting

### Common Issues and Solutions

1. **Port Conflicts**
   
   If port 5000 is already in use, change the PORT value in your .env file.

2. **Database Connection Errors**
   
   Check that PostgreSQL is running and your connection string is correct.

3. **TypeScript/Build Errors**
   
   Run `npm run check` to identify TypeScript errors.

4. **Missing Dependencies**
   
   Ensure all dependencies are installed with `npm install`.

### Getting Help

If you encounter issues not covered here, please check:

- The error logs for specific error messages
- The project README.md for additional information
- Contact the project maintainers for support