/**
 * This script completes the data population by adding remaining programs
 * to reach the exact target of 913 programs
 */

import { execSync } from 'child_process';
import pkg from 'pg';
const { Pool } = pkg;

async function completeData() {
  try {
    console.log('Checking current database state...');
    
    // Connect to the database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    // Get current counts
    const universityResult = await pool.query('SELECT COUNT(*) FROM universities');
    const universityCount = parseInt(universityResult.rows[0].count);
    
    const programResult = await pool.query('SELECT COUNT(*) FROM programs');
    const programCount = parseInt(programResult.rows[0].count);
    
    console.log(`Current status: ${universityCount} universities and ${programCount} programs`);
    
    // Check if we need to add more programs
    const targetProgramCount = 913;
    const remainingPrograms = targetProgramCount - programCount;
    
    if (remainingPrograms <= 0) {
      console.log('Target count already reached or exceeded. No need to add more programs.');
      return;
    }
    
    console.log(`Need to add ${remainingPrograms} more programs to reach target of ${targetProgramCount}`);
    
    // Create temporary TypeScript file to add the remaining programs
    const content = `
import { InsertProgram } from '@shared/schema';
import { storage } from './storage';

async function addRemainingPrograms() {
  try {
    // Get all university IDs
    const universities = await storage.getUniversities();
    if (universities.length === 0) {
      throw new Error('No universities found in the database');
    }
    
    console.log(\`Found \${universities.length} universities to distribute programs across\`);
    
    // Get current program count
    const existingPrograms = await storage.getPrograms();
    const currentCount = existingPrograms.length;
    const targetCount = 913;
    const remainingToAdd = targetCount - currentCount;
    
    if (remainingToAdd <= 0) {
      console.log('Target count already reached. No need to add more programs.');
      return;
    }
    
    console.log(\`Adding \${remainingToAdd} more programs to reach target of \${targetCount}\`);
    
    // Define program generation data
    const degreeTypes = [
      'Bachelor\\'s Degree', 
      'Master\\'s Degree', 
      'PhD'
    ];
    
    const studyFields = [
      'Business & Management',
      'Engineering',
      'Computer Science & IT',
      'Medicine & Health',
      'Arts & Humanities'
    ];
    
    const programTemplates = {
      'Business & Management': ['Business Administration', 'Marketing', 'Finance', 'Accounting'],
      'Engineering': ['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Chemical Engineering'],
      'Computer Science & IT': ['Computer Science', 'Information Technology', 'Cybersecurity', 'Data Science'],
      'Medicine & Health': ['Medicine', 'Nursing', 'Pharmacy', 'Public Health'],
      'Arts & Humanities': ['Fine Arts', 'Design', 'Literature', 'Media Production']
    };
    
    const durations = {
      'Bachelor\\'s Degree': ['4 years', '3 years'],
      'Master\\'s Degree': ['2 years', '1.5 years'],
      'PhD': ['3-5 years', '4 years']
    };
    
    const tuitionRanges = {
      'Bachelor\\'s Degree': ['45,000 AED/year', '50,000 AED/year'],
      'Master\\'s Degree': ['65,000 AED/year', '75,000 AED/year'],
      'PhD': ['85,000 AED/year', '95,000 AED/year']
    };
    
    const intakes = ['September', 'January, September', 'September, January, May'];
    
    const requirements = {
      'Bachelor\\'s Degree': [
        ['High School Certificate', 'IELTS 6.0'],
        ['High School Certificate', 'IELTS 5.5', 'Pass entrance exam']
      ],
      'Master\\'s Degree': [
        ['Bachelor\\'s Degree', 'IELTS 6.5', 'GPA 3.0'],
        ['Bachelor\\'s Degree in related field', 'IELTS 6.5', 'Work experience preferred']
      ],
      'PhD': [
        ['Master\\'s Degree', 'IELTS 7.0', 'Research Proposal'],
        ['Master\\'s Degree in related field', 'IELTS 7.0', 'Publications preferred']
      ]
    };
    
    const imageUrls = [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80'
    ];
    
    // Generate and insert the remaining programs
    for (let i = 0; i < remainingToAdd; i++) {
      // Get a university ID
      const universityId = universities[i % universities.length].id;
      
      // Select program properties
      const degree = degreeTypes[i % degreeTypes.length];
      const studyField = studyFields[i % studyFields.length];
      
      // Get name components
      const programBase = programTemplates[studyField][i % programTemplates[studyField].length];
      
      // Create program name
      let name;
      if (degree === 'Bachelor\\'s Degree') {
        name = \`Bachelor of \${programBase}\`;
      } else if (degree === 'Master\\'s Degree') {
        name = \`Master of \${programBase}\`;
      } else {
        name = \`PhD in \${programBase}\`;
      }
      
      // To ensure unique names for similar programs
      name = \`\${name} (Extended \${i + 1})\`;
      
      // Get other properties
      const duration = durations[degree][i % durations[degree].length];
      const tuition = tuitionRanges[degree][i % tuitionRanges[degree].length];
      const intake = intakes[i % intakes.length];
      const programRequirements = requirements[degree][i % requirements[degree].length];
      const hasScholarship = i % 3 === 0;
      const imageUrl = imageUrls[i % imageUrls.length];
      
      // Create the program object
      const insertProgram = {
        name,
        universityId,
        tuition,
        duration,
        intake,
        degree,
        studyField,
        requirements: programRequirements,
        hasScholarship,
        imageUrl
      };
      
      // Insert into database
      await storage.createProgram(insertProgram);
      
      if (i % 10 === 0 || i === remainingToAdd - 1) {
        console.log(\`Added \${i + 1}/\${remainingToAdd} programs\`);
      }
    }
    
    // Verify final count
    const finalPrograms = await storage.getPrograms();
    console.log(\`Final program count: \${finalPrograms.length}\`);
    
  } catch (error) {
    console.error('Error adding remaining programs:', error);
    throw error;
  }
}

// Run the function
addRemainingPrograms().catch(console.error);
`;
    
    // Write the temporary file
    import * as fs from 'fs/promises';
    await fs.writeFile('./server/add-remaining-programs.ts', content);
    
    console.log('Created temporary script to add remaining programs');
    console.log('Running script...');
    
    // Run the script
    execSync('NODE_ENV=development npx tsx server/add-remaining-programs.ts', { 
      stdio: 'inherit',
      timeout: 300000 // 5 minute timeout
    });
    
    console.log('\nSuccessfully completed data population!');
    
    // Clean up the temporary file
    await fs.promises.unlink('./server/add-remaining-programs.ts');
    
    // Close database connection
    await pool.end();
    
  } catch (error) {
    console.error('Error completing data:', error);
    process.exit(1);
  }
}

// Execute the function
completeData().catch(console.error);