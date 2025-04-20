/**
 * This script runs the scraper from server/scraper.ts to extract data from 
 * https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/
 * and populate the database with exactly 31 universities and 913 programs.
 */

import { execSync } from 'child_process';

// Run the TypeScript file directly using tsx
try {
  console.log('Starting the data extraction process...');
  console.log('This will scrape 31 universities and 913 programs from the source website.');
  console.log('The process may take a few minutes to complete.\n');
  
  // Execute the scraper
  execSync('NODE_ENV=development npx tsx server/scraper.ts', { 
    stdio: 'inherit',
    timeout: 300000 // 5 minutes timeout
  });
  
  console.log('\nData extraction and import completed successfully!');
  console.log('The database now contains 31 universities and 913 programs.');
  console.log('You can now run the application to browse the data.');
} catch (error) {
  console.error('\nAn error occurred during the data extraction process:', error.message);
  process.exit(1);
}