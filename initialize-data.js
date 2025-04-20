/**
 * This script initializes the database with exactly 31 universities and 913 programs
 * using the data generator in server/data-generator.ts
 */

import { execSync } from 'child_process';

async function initializeData() {
  try {
    console.log('Starting database initialization with 31 universities and 913 programs...');
    console.log('This may take a few minutes to complete.');
    
    // Run the data generator script
    execSync('NODE_ENV=development npx tsx server/data-generator.ts', { 
      stdio: 'inherit',
      timeout: 500000 // Longer timeout for database operations (8+ minutes)
    });
    
    console.log('\nData initialization completed successfully!');
    console.log('The database now contains exactly 31 universities and 913 programs.');
    console.log('You can view the data in the application by restarting the server.');
    
  } catch (error) {
    console.error('Error during data initialization:', error);
    process.exit(1);
  }
}

// Execute the function
initializeData();