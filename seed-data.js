/**
 * Smaller data seeding script
 * This will insert a smaller subset of data for testing purposes
 */

import { storage } from './server/storage';
import { generateUniversity, generateProgram } from './server/data-generator';

async function seedData() {
  try {
    console.log('Starting seeding of database with sample data...');

    const existingUniversities = await storage.getUniversities();
    const existingPrograms = await storage.getPrograms();

    if (existingUniversities.length >= 5 && existingPrograms.length >= 20) {
      console.log('Database already contains sufficient sample data:');
      console.log(`- ${existingUniversities.length} universities`);
      console.log(`- ${existingPrograms.length} programs`);
      console.log('Exiting without adding more data.');
      process.exit(0);
    }

    // Generate 10 universities
    const universities = [];
    for (let i = 0; i < 10; i++) {
      const university = generateUniversity(i);
      universities.push(university);
    }

    // Create universities in the database
    console.log('Creating universities in the database...');
    const universityIds = [];
    
    for (let i = 0; i < universities.length; i++) {
      const university = universities[i];
      const createdUniversity = await storage.createUniversity(university);
      universityIds.push(createdUniversity.id);
      console.log(`Created university: ${university.name} (ID: ${createdUniversity.id})`);
    }

    // Generate 5 programs per university (50 total)
    console.log('Creating programs in the database...');
    let programsCreated = 0;
    
    for (let i = 0; i < universityIds.length; i++) {
      const universityId = universityIds[i];
      
      // Generate 5 programs for this university
      for (let j = 0; j < 5; j++) {
        const program = generateProgram(universityId, i * 5 + j);
        
        // Update the universityId to match the created university
        const programToCreate = {
          ...program,
          universityId: universityId
        };
        
        await storage.createProgram(programToCreate);
        programsCreated++;
        
        console.log(`Created program: ${program.name} for university ID ${universityId}`);
      }
    }

    // Verify the data was imported
    const finalUniversities = await storage.getUniversities();
    const finalPrograms = await storage.getPrograms();

    console.log('Data seeding completed successfully!');
    console.log(`Final database state: ${finalUniversities.length} universities and ${finalPrograms.length} programs.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error during data seeding:', error);
    process.exit(1);
  }
}

// Start the seeding process
seedData();