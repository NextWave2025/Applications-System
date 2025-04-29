#!/bin/bash

# Guide Platform - Setup Local Database Script
# This script sets up your local PostgreSQL database with the necessary schema

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Guide Platform - Local Database Setup${NC}"
echo "-------------------------------------------"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}ERROR: .env file not found${NC}"
  echo "Please create a .env file with your database credentials."
  exit 1
fi

# Load database credentials from .env
source .env

# Extract database name from DATABASE_URL if it exists
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_NAME" ]; then
  # If not found in DATABASE_URL, use PGDATABASE
  DB_NAME=$PGDATABASE
fi

if [ -z "$DB_NAME" ]; then
  echo -e "${RED}ERROR: Could not determine database name from environment variables${NC}"
  echo "Please specify a database name in DATABASE_URL or PGDATABASE in your .env file."
  exit 1
fi

echo -e "${YELLOW}Setting up database: ${DB_NAME}${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
  echo -e "${RED}ERROR: PostgreSQL client (psql) not found${NC}"
  echo "Please install PostgreSQL before running this script."
  exit 1
fi

# Create database if it doesn't exist
echo -e "${YELLOW}Creating database if it doesn't exist...${NC}"
psql -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1
if [ $? -ne 0 ]; then
  echo -e "Database $DB_NAME does not exist. Creating..."
  createdb $DB_NAME
  if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to create database${NC}"
    exit 1
  fi
  echo -e "${GREEN}Database created successfully!${NC}"
else
  echo -e "Database $DB_NAME already exists."
fi

# Run the SQL script to create tables
echo -e "${YELLOW}Creating tables...${NC}"
psql -d $DB_NAME -f setup-local-db.sql

if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Failed to create tables${NC}"
  exit 1
else
  echo -e "${GREEN}Tables created successfully!${NC}"
fi

echo -e "\n${GREEN}Database setup complete!${NC}"
echo "You can now start the application with: npm run dev"
echo -e "Default users created:"
echo -e "  Admin: admin@example.com / password"
echo -e "  Agent: agent@example.com / password"
echo -e "\n${YELLOW}NOTE: In a production environment, you should use secure passwords and proper authentication.${NC}"