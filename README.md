# NextWave Platform - Project Documentation

## Project Overview

NextWave is a dynamic web platform designed to simplify educational program discovery for UAE students, offering an intuitive and engaging user experience for exploring academic opportunities. The platform features 31 universities and 913 programs with comprehensive details for prospective students.

## Project Architecture

### Technology Stack

#### Frontend
- **Framework**: React.js with TypeScript
- **Build System**: Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **API**: RESTful API design
- **Authentication**: Passport.js with session-based auth
- **Session Storage**: Express-session with connect-pg-simple

#### Database
- **Type**: PostgreSQL
- **ORM**: Drizzle ORM
- **Schema Validation**: Drizzle-zod
- **Migrations**: Drizzle Kit

#### Development Tools
- **Package Manager**: npm
- **TypeScript Compiler**: tsc
- **Development Server**: Vite + tsx

## Directory Structure

```
nextwave-platform/
├── client/                 # Frontend code
│   ├── src/                # React application source
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and shared logic
│   │   ├── pages/          # Application pages
│   │   ├── styles/         # Global stylesheets
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   └── vite.config.ts      # Vite configuration for frontend
│
├── server/                 # Backend code
│   ├── middleware/         # Express middleware
│   ├── routes/             # API route handlers
│   ├── auth.ts             # Authentication configuration
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # Route configuration
│   ├── storage.ts          # Data access layer
│   └── vite.ts             # Vite integration for development
│
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and types
│
├── migrations/             # Database migration files
│
├── public/                 # Static assets
│
├── setup-local-dev.sh      # Local development setup script
├── setup-local-database.sh # Local database setup script
├── cleanup.sh              # Project cleanup script
│
├── .env.example            # Example environment variables
├── drizzle.config.ts       # Drizzle ORM configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── LOCAL_DEVELOPMENT.md    # Local development guide
├── DEPLOYMENT.md           # Deployment instructions
└── CLEANUP_GUIDE.md        # Cleanup instructions
```

## Core Features

1. **University & Program Discovery**: Browse and search among 31 universities and 913 programs.
2. **Application Management**: Submit and track applications to programs.
3. **Agent Portal**: Educational agents can manage multiple student applications.
4. **Admin Dashboard**: Administrators can review and process applications.
5. **Document Upload**: Support for uploading required application documents.
6. **Status Tracking**: Real-time application status updates.

## Key Files and Components

### Database Schema

The database schema is defined in `shared/schema.ts` using Drizzle ORM. Main entities include:

- **Users**: Agents and administrators
- **Universities**: Educational institutions
- **Programs**: Academic programs offered by universities
- **Applications**: Student applications to programs
- **Documents**: Application documents
- **Audit Logs**: System activity tracking

### Authentication

Authentication is implemented in `server/auth.ts` using Passport.js with local strategy:

- Session-based authentication
- Role-based access control (agent/admin)
- Secure password hashing

### API Endpoints

Main API endpoints include:

- `/api/login`, `/api/register`, `/api/logout`: Authentication
- `/api/user`: Current user information
- `/api/programs`: Program search and details
- `/api/applications`: Application management
- `/api/documents`: Document upload and management

## Environment Setup

### Required Environment Variables

```
# Database Configuration
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOSTNAME:PORT/DATABASE_NAME
PGPORT=PORT
PGUSER=USERNAME
PGPASSWORD=PASSWORD
PGDATABASE=DATABASE_NAME
PGHOST=HOSTNAME

# Session Configuration
SESSION_SECRET=your_secure_session_secret

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Development Setup

See `LOCAL_DEVELOPMENT.md` for detailed instructions on setting up the development environment.

### Quick Start

1. Copy `.env.example` to `.env` and update with your settings
2. Run `./setup-local-database.sh` to set up the database
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server

## Deployment Requirements

The application can be deployed using various approaches. See `DEPLOYMENT.md` for detailed instructions.

### AWS Deployment Options

1. **AWS Elastic Beanstalk**: Recommended for simplicity
   - Node.js platform
   - Environment variables for database connection
   - Suitable for most production needs

2. **AWS App Runner**: For containerized deployment
   - Container-based deployment
   - Automatic scaling
   - Minimal configuration needed

3. **AWS Amplify**: Frontend-focused deployment
   - Great for React applications
   - Continuous deployment from Git
   - Easy setup for frontend applications

4. **ECS Fargate + RDS**: For advanced scalability
   - Containerized deployment with Docker
   - Managed PostgreSQL with RDS
   - More control over infrastructure

### Database Deployment

The application uses PostgreSQL, which can be deployed as:

1. **Existing Neon Database**: Continue using the current cloud PostgreSQL provider
2. **AWS RDS**: Migrate to Amazon's managed PostgreSQL service
3. **Self-hosted PostgreSQL**: For complete control over the database

## Build Process

```bash
# Build the application
npm run build

# Start in production mode
npm run start
```

The build process:
1. Compiles TypeScript for server-side code
2. Builds React application with Vite
3. Bundles server code with ESBuild
4. Outputs to the `dist` directory

## Additional Resources

- **LOCAL_DEVELOPMENT.md**: Detailed instructions for local development
- **DEPLOYMENT.md**: Comprehensive deployment guide
- **CLEANUP_GUIDE.md**: Instructions for cleaning up development files before production

## Colors and Branding

- Primary color: #EF3009
- Font family: Outfit (Light 300, Medium 500, Bold 700)
- Typography: Section headers (64px), Subheadings (25px), Body text (16px)
- Border radius: 8px on all containers
- Minimum clear space: 80px around important elements

## Contact

For any questions or support regarding this project, please contact the project maintainers.