# Guide Platform Deployment Guide

This document provides detailed instructions for deploying the Guide Platform to AWS Elastic Beanstalk.

## Prerequisites

- AWS account with Elastic Beanstalk access
- Familiarity with AWS console
- PostgreSQL database (Neon or AWS RDS)

## Deployment Steps

### 1. Prepare the Deployment Package

Run the provided deployment script to create a proper production build:

```bash
# Make the script executable
chmod +x prepare-eb-deploy.sh

# Run the deployment script
./prepare-eb-deploy.sh
```

This script will:
- Build the application
- Create a clean deployment package with only the necessary production files
- Generate a deployment zip file `eb-deploy.zip` in the project root

### 2. Create an Elastic Beanstalk Environment

1. Log in to your AWS Management Console
2. Navigate to the Elastic Beanstalk service
3. Click "Create Application"
4. Enter the application name (e.g., "Guide-Platform")
5. Select "Web server environment"
6. Platform: Node.js
7. Platform branch: Node.js 18 (or latest LTS)
8. Platform version: Recommended
9. Application code: Upload your code
10. Source code origin: Upload a local file
11. Choose File: Select the `eb-deploy.zip` created by the deployment script
12. Click "Create environment"

### 3. Configure Environment Variables

Once your environment is created, you need to configure the necessary environment variables:

1. Navigate to your new Elastic Beanstalk environment
2. In the left navigation, click "Configuration"
3. Under "Software", click "Edit"
4. Scroll down to "Environment properties"
5. Add the following key-value pairs:
   - Key: `DATABASE_URL`, Value: `postgres://username:password@hostname:port/database?sslmode=require` (use your actual database credentials)
   - Key: `SESSION_SECRET`, Value: [a secure random string]
6. Click "Apply"

### 4. Verify Deployment

1. Wait for the environment to update (this may take a few minutes)
2. Once the environment shows "Health: Ok", click on the URL provided
3. Your application should be running
4. Check the logs for any errors:
   - Navigate to "Logs" in the left sidebar
   - Request "Request logs" and view "Last 100 lines of log"

### 5. Troubleshooting Common Issues

If you encounter issues during deployment:

#### Application Crashes or Shows 502 Error

1. Check the logs to identify the error
2. Common issues include:
   - Missing environment variables
   - Database connection failures
   - Port conflicts

#### Database Connection Issues

1. Verify your `DATABASE_URL` is correct
2. Ensure your database allows connections from the Elastic Beanstalk IP range
3. Check that `sslmode=require` is included in the connection string
4. For Neon database, make sure you're using the correct connection string format

#### Memory Issues

If your application runs out of memory:

1. Go to "Configuration" > "Instance" > "Edit"
2. Choose a larger instance type
3. Click "Apply"

### 6. Production Optimizations

For a production environment, consider:

1. **Scaling**: Configure auto-scaling based on load
   - Go to "Configuration" > "Capacity" > "Edit"
   - Enable auto-scaling with appropriate triggers

2. **HTTPS**: Configure SSL/TLS
   - Create or upload SSL certificate
   - Configure load balancer to use HTTPS

3. **Monitoring**: Set up CloudWatch alarms
   - Go to "Alarms" in the left sidebar
   - Create alarms for metrics like CPU usage, request count, etc.

## Database Migration

If you need to migrate your database from development to production:

1. Export your data from the development database
2. Import it into your production database
3. Verify all data was migrated correctly

## Maintenance and Updates

For future updates:

1. Make changes to your codebase
2. Run the deployment script to create a new deployment package
3. Upload the new package to your Elastic Beanstalk environment
4. Elastic Beanstalk will handle the deployment and rollover

## Rollback

If you need to rollback to a previous version:

1. In your Elastic Beanstalk environment, go to "Application versions"
2. Select the version you want to rollback to
3. Click "Deploy"

## Support

For any deployment issues, check:
1. AWS Elastic Beanstalk documentation
2. AWS Node.js platform guides
3. Neon database documentation (if using Neon)