import fs from 'fs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { universities, programs } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function importData() {
  try {
    console.log('Loading Excel data...');
    const rawData = JSON.parse(fs.readFileSync('./extracted-consolidated data.json', 'utf8'));
    console.log(`Found ${rawData.length} program records`);

    // Extract unique universities
    const universityNames = [...new Set(rawData.map(row => row['University name']))];
    console.log(`Found ${universityNames.length} unique universities`);

    // Create universities
    const universityMap = new Map();
    for (const universityName of universityNames) {
      try {
        // Check if university already exists
        const existing = await db.select().from(universities).where(eq(universities.name, universityName));
        
        if (existing.length > 0) {
          universityMap.set(universityName, existing[0].id);
          console.log(`University "${universityName}" already exists with ID ${existing[0].id}`);
        } else {
          // Create new university
          const [newUniversity] = await db.insert(universities).values({
            name: universityName,
            location: "UAE", // Default location
            imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          }).returning();
          
          universityMap.set(universityName, newUniversity.id);
          console.log(`Created university "${universityName}" with ID ${newUniversity.id}`);
        }
      } catch (error) {
        console.error(`Error creating university "${universityName}":`, error.message);
      }
    }

    console.log(`\nProcessing ${rawData.length} programs...`);
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      try {
        const universityId = universityMap.get(row['University name']);
        if (!universityId) {
          console.error(`No university ID found for "${row['University name']}"`);
          errors++;
          continue;
        }

        // Parse requirements
        let requirements = [];
        if (row['General Entry Requirements and Documents']) {
          requirements = [row['General Entry Requirements and Documents']];
        }

        // Map degree level to study field
        const degreeLevel = row['Degree Level'] || 'Certificate';
        let studyField = 'General Studies';
        if (degreeLevel.toLowerCase().includes('business')) studyField = 'Business';
        else if (degreeLevel.toLowerCase().includes('engineering')) studyField = 'Engineering';
        else if (degreeLevel.toLowerCase().includes('medical')) studyField = 'Medicine';
        else if (degreeLevel.toLowerCase().includes('law')) studyField = 'Law';
        else if (degreeLevel.toLowerCase().includes('education')) studyField = 'Education';

        const programData = {
          name: row['Name of Degree'] || `Program ${i + 1}`,
          universityId: universityId,
          tuition: '0 AED/year', // No tuition data in the Excel
          duration: '1 year', // Default duration
          intake: row['Intakes'] || 'September',
          degree: degreeLevel,
          studyField: studyField,
          requirements: requirements,
          hasScholarship: false, // No scholarship data in Excel
          imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        };

        // Check if program already exists
        const existingProgram = await db.select().from(programs)
          .where(eq(programs.name, programData.name))
          .where(eq(programs.universityId, universityId));

        if (existingProgram.length > 0) {
          // Update existing program
          await db.update(programs)
            .set(programData)
            .where(eq(programs.id, existingProgram[0].id));
          updated++;
        } else {
          // Create new program
          await db.insert(programs).values(programData);
          created++;
        }

        if ((i + 1) % 50 === 0) {
          console.log(`Processed ${i + 1}/${rawData.length} programs...`);
        }

      } catch (error) {
        console.error(`Error processing program ${i + 1}:`, error.message);
        errors++;
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Universities created: ${universityNames.length - universityMap.size}`);
    console.log(`Programs created: ${created}`);
    console.log(`Programs updated: ${updated}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total processed: ${created + updated + errors}`);

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await sql.end();
  }
}

importData();