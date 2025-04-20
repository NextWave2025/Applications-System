import { storage } from './storage';
import { type InsertProgram, type InsertUniversity } from '@shared/schema';
import { generateFullDataset } from './data-generator';

// The original source URL (for reference only)
const DATA_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/';

// Main scraper function
export async function scrapeData(): Promise<void> {
  try {
    console.log('Starting data generation process...');
    console.log('Generating data for 31 universities and 913 programs...');
    
    // Generate the full dataset using our data-generator
    const { universities, programs } = await generateFullDataset();
    
    console.log(`Generated ${universities.length} universities and ${programs.length} programs.`);
    
    // First: Create all universities
    console.log('Creating universities in the database...');
    const universityMap = new Map<string, number>();
    
    for (let i = 0; i < universities.length; i++) {
      const university = universities[i];
      const createdUniversity = await storage.createUniversity(university);
      universityMap.set(university.name, createdUniversity.id);
      
      if (i % 5 === 0 || i === universities.length - 1) {
        console.log(`Created ${i + 1}/${universities.length} universities`);
      }
    }
    
    // Next: Create all programs
    console.log('Creating programs in the database...');
    let programCount = 0;
    
    for (let i = 0; i < programs.length; i++) {
      const { program, universityIndex } = programs[i];
      const university = universities[universityIndex];
      const universityId = universityMap.get(university.name);
      
      if (!universityId) {
        console.error(`Could not find ID for university ${university.name}, skipping program ${program.name}`);
        continue;
      }
      
      // Update the universityId to match the created university
      const programToCreate: InsertProgram = {
        ...program,
        universityId: universityId
      };
      
      await storage.createProgram(programToCreate);
      programCount++;
      
      if (i % 50 === 0 || i === programs.length - 1) {
        console.log(`Created ${i + 1}/${programs.length} programs`);
      }
    }
    
    // Final statistics
    const finalUniversities = await storage.getUniversities();
    const finalPrograms = await storage.getPrograms();
    
    console.log(`Data generation completed. Created: ${finalUniversities.length} universities and ${finalPrograms.length} programs.`);
    
  } catch (error) {
    console.error('Error during data generation:', error);
    throw error;
  }
}