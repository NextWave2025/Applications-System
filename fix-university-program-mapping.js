/**
 * Script to fix university-program mapping issues
 * This will ensure all programs are properly associated with their universities
 */

import fs from 'fs';
import pg from 'pg';
const { Client } = pg;

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function fixUniversityProgramMapping() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Load the Excel data
    const excelData = JSON.parse(fs.readFileSync('./extracted-consolidated data.json', 'utf8'));
    console.log(`Loaded ${excelData.length} program records from Excel`);

    // Get current universities from database
    const universitiesResult = await client.query('SELECT id, name FROM universities ORDER BY name');
    const universities = universitiesResult.rows;
    console.log(`Found ${universities.length} universities in database`);

    // Create a mapping of university names to IDs
    const universityNameToId = new Map();
    universities.forEach(uni => {
      universityNameToId.set(uni.name, uni.id);
      // Also add variations for better matching
      universityNameToId.set(uni.name.toLowerCase(), uni.id);
      universityNameToId.set(uni.name.trim(), uni.id);
    });

    // Process each program record and fix mapping
    let fixedCount = 0;
    let notFoundCount = 0;
    const unmatchedUniversities = new Set();

    for (const record of excelData) {
      const universityName = record['University name'];
      const programName = record['Name of Degree'];
      const degreeLevel = record['Degree Level'];
      
      if (!universityName || !programName) continue;

      // Find the university ID
      let universityId = universityNameToId.get(universityName) || 
                        universityNameToId.get(universityName.toLowerCase()) ||
                        universityNameToId.get(universityName.trim());

      if (!universityId) {
        // Try fuzzy matching
        for (const [dbName, id] of universityNameToId.entries()) {
          if (typeof dbName === 'string' && 
              (dbName.toLowerCase().includes(universityName.toLowerCase()) ||
               universityName.toLowerCase().includes(dbName.toLowerCase()))) {
            universityId = id;
            break;
          }
        }
      }

      if (universityId) {
        // Check if program already exists for this university
        const existingProgram = await client.query(
          'SELECT id FROM programs WHERE university_id = $1 AND name = $2',
          [universityId, programName]
        );

        if (existingProgram.rows.length === 0) {
          // Insert the program
          await client.query(`
            INSERT INTO programs (
              name, university_id, degree, intake, 
              requirements, tuition, duration, study_field, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            programName,
            universityId,
            degreeLevel || 'Bachelor',
            record['Intakes'] || 'September',
            JSON.stringify([record['General Entry Requirements'] || 'Standard entry requirements apply']),
            'Contact university for details',
            'Standard duration',
            'General Studies',
            '/api/placeholder/400/300'
          ]);
          fixedCount++;
        }
      } else {
        unmatchedUniversities.add(universityName);
        notFoundCount++;
      }
    }

    console.log(`\nMapping Results:`);
    console.log(`✓ Fixed/Added ${fixedCount} program mappings`);
    console.log(`✗ Could not match ${notFoundCount} programs`);
    
    if (unmatchedUniversities.size > 0) {
      console.log(`\nUnmatched universities:`);
      unmatchedUniversities.forEach(name => console.log(`- ${name}`));
    }

    // Show final counts
    const finalCounts = await client.query(`
      SELECT u.name, COUNT(p.id) as program_count 
      FROM universities u 
      LEFT JOIN programs p ON u.id = p.university_id 
      GROUP BY u.id, u.name 
      ORDER BY program_count DESC
    `);

    console.log(`\nFinal university program counts:`);
    finalCounts.rows.forEach(row => {
      console.log(`${row.name}: ${row.program_count} programs`);
    });

  } catch (error) {
    console.error('Error fixing university-program mapping:', error);
  } finally {
    await client.end();
  }
}

fixUniversityProgramMapping();