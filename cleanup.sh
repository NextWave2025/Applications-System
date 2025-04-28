#!/bin/bash

# Guide Platform Project Cleanup Script
# This script removes non-essential files from the project for production deployment

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Guide Platform - Project Cleanup${NC}"
echo "-------------------------------------------"

# Define arrays of files to remove
REPLIT_FILES=(
    ".replit"
    ".replit.simplified"
    "light-dev.js"
    "run-with-diagnostics.js"
    "check-server.js"
)

SCRAPER_FILES=(
    "advanced-scraper.js"
    "check-data.js"
    "complete-data.js"
    "cookies.txt"
    "create-db-tables.js"
    "extract-and-populate.js"
    "extract-complete-data.js"
    "extract-data-axios.js"
    "extract-data.js"
    "extracted-programs.json"
    "extracted-universities.json"
    "import-direct-data.js"
    "import-full-data.js"
    "initialize-data.js"
    "lightweight-server.js"
    "raw-program-page.html"
    "raw-university-page.html"
    "run-scraper.js"
    "scraper.js"
    "seed-data.js"
    "start-server.js"
    "static-test.html"
    "test-db-connection.js"
    "test-fetch.js"
    "server/scraper.ts"
    "server/data-generator.ts"
    "server/create-test-audit-log.ts"
    "server/add-remaining-programs.ts"
    "server/check-admin.ts"
    "server/create-admin.ts"
    "server/create-session-table.js"
    "server/check-server.js"
    "server/light-dev.js"
    "server/recreate-admin.ts"
    "server/run-server.js"
    "server/simplified.js"
    "server/test-login.ts"
    "server/update-schema.ts"
)

# Function to remove files
remove_files() {
    local file_list=("$@")
    for file in "${file_list[@]}"; do
        if [ -f "$file" ]; then
            rm "$file"
            echo -e "${GREEN}Removed${NC}: $file"
        else
            echo -e "${YELLOW}Not found${NC}: $file"
        fi
    done
}

# Confirm with user
echo -e "${YELLOW}This script will remove non-essential files from the project.${NC}"
echo "This includes Replit configuration files and data scraping scripts that are not needed for production."
read -p "Do you want to proceed? (y/n): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo -e "${RED}Operation cancelled.${NC}"
    exit 1
fi

# Remove Replit-specific files
echo -e "\n${YELLOW}Removing Replit-specific files...${NC}"
remove_files "${REPLIT_FILES[@]}"

# Remove scraper and data generation files
echo -e "\n${YELLOW}Removing scraper and data generation files...${NC}"
remove_files "${SCRAPER_FILES[@]}"

# Remove attached_assets directory
if [ -d "attached_assets" ]; then
    echo -e "\n${YELLOW}Removing attached_assets directory...${NC}"
    rm -rf attached_assets
    echo -e "${GREEN}Removed${NC}: attached_assets/"
fi

# Remove extracted directory 
if [ -d "extracted" ]; then
    echo -e "\n${YELLOW}Removing extracted directory...${NC}"
    rm -rf extracted
    echo -e "${GREEN}Removed${NC}: extracted/"
fi

echo -e "\n${GREEN}Cleanup complete!${NC}"
echo "The project now contains only the files necessary for production deployment."
echo -e "${YELLOW}Remember to commit these changes to your repository.${NC}"