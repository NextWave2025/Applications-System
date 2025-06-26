# NextWave Platform - Project Cleanup Guide

This document provides instructions for manually cleaning up unnecessary files in the NextWave Platform project before production deployment.

## Files to Remove

### Replit-Specific Files

These files are specific to the Replit environment and are not needed for local development or production:

- `.replit`
- `.replit.simplified`
- `.config/` (directory)
- `.upm/` (directory)
- `light-dev.js`
- `run-with-diagnostics.js`
- `check-server.js`

### Data Scraping and Development Tools

These files were used for data collection and initial setup but are not needed for the running application:

- `advanced-scraper.js`
- `check-data.js`
- `complete-data.js`
- `cookies.txt`
- `create-db-tables.js`
- `extract-and-populate.js`
- `extract-complete-data.js`
- `extract-data-axios.js`
- `extract-data.js`
- `extracted-programs.json`
- `extracted-universities.json`
- `import-direct-data.js`
- `import-full-data.js`
- `initialize-data.js`
- `lightweight-server.js`
- `raw-program-page.html`
- `raw-university-page.html`
- `run-scraper.js`
- `scraper.js`
- `seed-data.js`
- `start-server.js`
- `static-test.html`
- `test-db-connection.js`
- `test-fetch.js`

### Server Development Files

- `server/scraper.ts`
- `server/data-generator.ts`
- `server/create-test-audit-log.ts`
- `server/add-remaining-programs.ts`
- `server/check-admin.ts`
- `server/create-admin.ts`
- `server/create-session-table.js`
- `server/check-server.js`
- `server/light-dev.js`
- `server/recreate-admin.ts`
- `server/run-server.js`
- `server/simplified.js`
- `server/test-login.ts`
- `server/update-schema.ts`

### Directories

- `attached_assets/` (contains temporary assets used during development)
- `extracted/` (contains extracted code samples)

## Manual Cleanup Process

If the provided cleanup script doesn't work in your environment, you can manually delete these files:

1. Use your file explorer or terminal to locate and delete the files listed above
2. For directories, use `rm -rf directory_name` (Unix) or delete through your file explorer (Windows)
3. After cleaning up, make sure to test the application to ensure everything still works correctly

## Verification

After removing these files, your project structure should look like this:

```
guide-platform/
├── client/                 # Frontend code
├── server/                 # Backend code
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── auth.ts             # Authentication logic
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # Route configuration
│   ├── storage.ts          # Data access layer
│   └── vite.ts             # Vite configuration
├── shared/                 # Shared code
│   └── schema.ts           # Database schema
├── migrations/             # Database migrations
├── .env                    # Environment variables (not versioned)
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── README.md               # Project documentation
├── LOCAL_DEVELOPMENT.md    # Development guide
├── cleanup.sh              # Cleanup script
├── setup-local-dev.sh      # Setup script
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Next Steps After Cleanup

1. Run `git status` to see if there are any new files that should be added to version control
2. Commit your changes: `git commit -m "Clean up project for production"`
3. Continue with deployment following the instructions in the README.md