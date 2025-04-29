#!/bin/bash
# Elastic Beanstalk deployment preparation script

echo "Preparing deployment package for Elastic Beanstalk..."

# Ensure we're in the project root directory
PROJECT_ROOT=$(pwd)
DEPLOY_DIR="$PROJECT_ROOT/eb-deploy"

# Clean any existing deployment directory
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Build the application
echo "Building application..."
npm run build

# Copy production-required files to deployment directory
echo "Copying files to deployment package..."
cp -r dist "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"

# Create a simplified package.json for production
echo "Creating production package.json..."
node -e "
const pkg = require('./package.json');
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  type: pkg.type,
  engines: { node: '>=16.0.0' },
  scripts: {
    start: 'NODE_ENV=production node dist/index.js'
  },
  dependencies: {
    // Include only the runtime dependencies needed for the server
    'express': pkg.dependencies.express,
    '@neondatabase/serverless': pkg.dependencies['@neondatabase/serverless'],
    'drizzle-orm': pkg.dependencies['drizzle-orm'],
    'ws': pkg.dependencies.ws,
    'passport': pkg.dependencies.passport,
    'passport-local': pkg.dependencies['passport-local'],
    'express-session': pkg.dependencies['express-session'],
    'connect-pg-simple': pkg.dependencies['connect-pg-simple'],
    'dotenv': pkg.dependencies.dotenv
    // Add any other server-side runtime dependencies here
  }
};
require('fs').writeFileSync('$DEPLOY_DIR/package.json', JSON.stringify(prodPkg, null, 2));
"

# Create necessary configuration files for Elastic Beanstalk
echo "Creating Elastic Beanstalk configuration files..."

# Create Procfile
cat > "$DEPLOY_DIR/Procfile" << EOL
web: npm run start
EOL

# Create .ebextensions directory and configuration
mkdir -p "$DEPLOY_DIR/.ebextensions"
cat > "$DEPLOY_DIR/.ebextensions/nodecommand.config" << EOL
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm run start"
EOL

# Create .ebextensions to set environment variables
cat > "$DEPLOY_DIR/.ebextensions/environment.config" << EOL
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
EOL

# Create .env.example as a template
cat > "$DEPLOY_DIR/.env.example" << EOL
# Production Environment Configuration
NODE_ENV=production
PORT=8081

# Database Configuration
DATABASE_URL=postgres://username:password@hostname:port/database?sslmode=require

# Session Configuration
SESSION_SECRET=your_secure_session_secret
EOL

# Create a README with deployment instructions
cat > "$DEPLOY_DIR/DEPLOY.md" << EOL
# Deployment Instructions

This package is prepared for deployment to AWS Elastic Beanstalk.

## Before Deployment

1. Make sure to configure the following environment variables in the Elastic Beanstalk environment:
   - DATABASE_URL
   - SESSION_SECRET

## Deployment Steps

1. Zip this entire directory
2. Upload the zip file to Elastic Beanstalk
3. Deploy the application

## Post-Deployment

1. Verify the application is running correctly
2. Check the logs for any errors
EOL

# Create zip file for deployment
echo "Creating deployment zip file..."
cd "$DEPLOY_DIR"
zip -r ../eb-deploy.zip .
cd "$PROJECT_ROOT"

echo "Deployment package created at eb-deploy.zip"
echo "Upload this file to AWS Elastic Beanstalk to deploy your application."