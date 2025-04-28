# Guide - Educational Program Discovery Platform

Guide is a comprehensive web platform designed to connect UAE students with educational opportunities. The application allows users to explore universities and their programs, filter by various criteria, and submit applications.

## Tech Stack

- **Frontend**: React with TypeScript, Vite, TailwindCSS, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **API**: RESTful architecture

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v18 or higher)
- npm (v8 or higher)
- PostgreSQL (v14 or higher)

## Local Development Setup

### Step 1: Clone the repository

```bash
git clone <your-repository-url>
cd guide-platform
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Set up the environment variables

1. Create a `.env` file in the root of the project:

```bash
cp .env.example .env
```

2. Fill in the environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A secure random string for session encryption
   - `PORT`: The port on which to run the application (default 5000)
   - `NODE_ENV`: Set to `development` for local development

### Step 4: Set up the database

1. Create a PostgreSQL database for the project:

```bash
createdb guide_db
```

2. Run the database migrations to set up the schema:

```bash
npm run db:push
```

### Step 5: Start the development server

```bash
npm run dev
```

This will start both the backend Express server and the frontend Vite development server. The application will be available at `http://localhost:5000`.

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the project for production
- `npm run start`: Run the production build
- `npm run check`: Run TypeScript type checking
- `npm run db:push`: Apply database schema changes

## Project Structure

```
guide-platform/
├── client/                 # Frontend code
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # Frontend assets
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Layout components
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Entry point
├── server/                 # Backend code
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── auth.ts             # Authentication logic
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # Route configuration
│   ├── storage.ts          # Data access layer
│   └── vite.ts             # Vite configuration for serving the frontend
├── shared/                 # Shared code between frontend and backend
│   └── schema.ts           # Database schema and types
├── migrations/             # Database migrations
├── .env                    # Environment variables (not versioned)
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json            # Node.js dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Database Schema

The application uses the following main database tables:

- `users`: User accounts for agents and admins
- `universities`: Information about educational institutions
- `programs`: Academic programs offered by universities
- `applications`: Student applications to programs
- `documents`: Files attached to applications (passports, transcripts, etc.)
- `auditLogs`: Audit trail of administrative actions

## Production Deployment

To deploy the application in a production environment:

1. Build the project:

```bash
npm run build
```

2. Set the appropriate environment variables for production.

3. Start the production server:

```bash
npm run start
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit your changes: `git commit -m 'Add my feature'`
3. Push to the branch: `git push origin feature/my-feature`
4. Submit a pull request

## License

[MIT](LICENSE)