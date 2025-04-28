#!/bin/bash

# Guide Platform - Local Development Setup Script
# This script sets up your local development environment for the Guide Platform

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Guide Platform - Local Development Setup${NC}"
echo "-------------------------------------------"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo -e "\n${YELLOW}Creating .env file from template...${NC}"
  cp .env.example .env
  echo -e "${GREEN}Created .env file. Please update it with your database credentials.${NC}"
else
  echo -e "\n${YELLOW}Using existing .env file.${NC}"
fi

# Check if required environment variables are set
echo -e "\n${YELLOW}Checking environment configuration...${NC}"
source .env

if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}ERROR: DATABASE_URL is not set in your .env file.${NC}"
  echo "Please update your .env file with the correct database connection URL."
  exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
  echo -e "${YELLOW}WARNING: SESSION_SECRET is not set in your .env file.${NC}"
  echo "A secure session secret is recommended for production."
fi

# Check database connection
echo -e "\n${YELLOW}Testing database connection...${NC}"
npx drizzle-kit push 2>/dev/null

if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Failed to connect to the database.${NC}"
  echo "Please check your database credentials in the .env file."
  exit 1
else
  echo -e "${GREEN}Database connection successful!${NC}"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "\n${YELLOW}Installing dependencies...${NC}"
  npm install
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install dependencies.${NC}"
    exit 1
  else
    echo -e "${GREEN}Dependencies installed successfully!${NC}"
  fi
else
  echo -e "\n${YELLOW}Dependencies already installed. Skipping...${NC}"
fi

# Apply database migrations
echo -e "\n${YELLOW}Applying database schema...${NC}"
npx drizzle-kit push

if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Failed to apply database schema.${NC}"
  exit 1
else
  echo -e "${GREEN}Database schema applied successfully!${NC}"
fi

# Run TypeScript check
echo -e "\n${YELLOW}Running TypeScript checks...${NC}"
npm run check

if [ $? -ne 0 ]; then
  echo -e "${RED}WARNING: TypeScript check found issues. You might encounter problems when running the application.${NC}"
else
  echo -e "${GREEN}TypeScript check passed!${NC}"
fi

echo -e "\n${GREEN}Setup completed successfully!${NC}"
echo -e "You can now start the development server with: ${YELLOW}npm run dev${NC}"
echo -e "The application will be available at: ${YELLOW}http://localhost:5000${NC}"
echo -e "\n${YELLOW}Notes:${NC}"
echo "1. Make sure your PostgreSQL database is running"
echo "2. Update your .env file with the correct database credentials if needed"
echo "3. For Windows users, use 'set NODE_ENV=development && tsx server/index.ts' instead of 'npm run dev'"
echo "4. If you encounter any issues, refer to LOCAL_DEVELOPMENT.md for troubleshooting"