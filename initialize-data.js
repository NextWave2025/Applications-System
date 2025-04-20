/**
 * Data initialization script
 * Run this script to initialize the database with universities and programs
 * from the data generator.
 */

// We need to run this with tsx
// NODE_ENV=development tsx initialize-data.js

import { storage } from './server/storage';
import { scrapeData } from './server/scraper';

async function initializeData() {
  try {
    console.log('Starting initialization of database with universities and programs...');

    // Check if we already have data in the database
    const existingUniversities = await storage.getUniversities();
    const existingPrograms = await storage.getPrograms();

    if (existingUniversities.length > 0 || existingPrograms.length > 0) {
      console.log('Database already contains data:');
      console.log(`- ${existingUniversities.length} universities`);
      console.log(`- ${existingPrograms.length} programs`);
      
      const answer = process.argv.includes('--force') ? 'y' : '';
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Exiting without modifying existing data.');
        process.exit(0);
      }
      
      console.log('Proceeding with data initialization...');
    }

    // Generate and import data
    await scrapeData();

    // Verify the data was imported
    const finalUniversities = await storage.getUniversities();
    const finalPrograms = await storage.getPrograms();

    console.log('Data initialization completed successfully!');
    console.log(`Final database state: ${finalUniversities.length} universities and ${finalPrograms.length} programs.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error during data initialization:', error);
    process.exit(1);
  }
}

// Start the initialization process
initializeData();