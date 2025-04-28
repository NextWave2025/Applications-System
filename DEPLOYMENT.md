# Guide Platform - Deployment Guide

This document provides instructions for deploying the Guide Platform to a production environment.

## Prerequisites

Before deploying, ensure you have:

- Cleaned up the project using the cleanup script or following the CLEANUP_GUIDE.md
- Tested the application thoroughly in a development environment
- A PostgreSQL database provisioned for production use
- A hosting environment with Node.js support (v18 or higher)

## Deployment Options

### Option 1: Traditional Server Deployment

#### Step 1: Prepare the Project

1. Build the project for production:

```bash
npm run build
```

This will create a `dist` directory with the compiled frontend and backend code.

#### Step 2: Set Up Environment Variables

Create a `.env` file in your production environment with the following variables:

```
NODE_ENV=production
DATABASE_URL=your_production_database_url
SESSION_SECRET=your_secure_production_secret
PORT=5000  # Or the port specified by your hosting provider
```

Make sure to use a secure, randomly generated string for `SESSION_SECRET` and the correct connection string for your production database.

#### Step 3: Start the Server

```bash
npm run start
```

### Option 2: Docker Deployment

For Docker-based deployments, you can create a Dockerfile in the project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/
COPY .env.example ./

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]
```

Build and run the Docker container:

```bash
docker build -t guide-platform .
docker run -p 5000:5000 --env-file .env -d guide-platform
```

### Option 3: Cloud Platform Deployment

The Guide Platform can be deployed to various cloud platforms:

#### Heroku

1. Create a `Procfile` in the project root:
```
web: npm start
```

2. Deploy using the Heroku CLI:
```bash
heroku create
git push heroku main
heroku config:set DATABASE_URL=your_production_database_url
heroku config:set SESSION_SECRET=your_secure_production_secret
heroku config:set NODE_ENV=production
```

#### AWS Elastic Beanstalk

1. Initialize Elastic Beanstalk in your project:
```bash
eb init
```

2. Create an environment and deploy:
```bash
eb create guide-production
```

3. Set environment variables:
```bash
eb setenv DATABASE_URL=your_production_database_url SESSION_SECRET=your_secure_production_secret NODE_ENV=production
```

## Database Migration for Production

Before deploying, make sure your production database schema is up to date:

```bash
# Update DATABASE_URL in your .env to point to the production database temporarily
DATABASE_URL=your_production_database_url npm run db:push
```

## SSL Configuration

For production, it's essential to use HTTPS. If your hosting provider doesn't handle this automatically, you'll need to configure SSL:

1. Acquire SSL certificates (e.g., using Let's Encrypt)
2. Update your server configuration to use these certificates

## Monitoring and Logging

Consider setting up monitoring and logging for your production deployment:

1. Use a service like New Relic, Datadog, or Sentry for application monitoring
2. Set up centralized logging using solutions like ELK Stack or Papertrail
3. Configure database performance monitoring

## Scaling Considerations

As your application grows, consider:

1. Implementing a caching layer (e.g., Redis)
2. Setting up a load balancer for multiple application instances
3. Optimizing database queries and adding appropriate indexes
4. Implementing a CDN for static assets

## Production Checklist

Before going live, verify:

- [ ] Application builds without errors
- [ ] All environment variables are properly set
- [ ] Database migrations have been applied
- [ ] Static assets are being served correctly
- [ ] SSL is properly configured
- [ ] Error handling and logging are working
- [ ] Authentication and authorization function as expected
- [ ] Performance is acceptable under expected load

## Rollback Plan

If issues arise after deployment:

1. Keep the previous version's build artifacts
2. Document the steps to revert to the previous version
3. Have a database backup from before the deployment