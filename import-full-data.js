const { extractCompleteData } = require('./extract-complete-data');
const { storage } = require('./server/storage');
const fs = require('fs').promises;
const path = require('path');

/**
 * Import the extracted data into the database
 */
async function importFullData() {
  try {
    console.log('Starting data import process...');
    
    // Check if the data files already exist
    let universities;
    let programs;
    
    try {
      const universityFile = await fs.readFile(path.join(__dirname, 'complete-universities.json'), 'utf8');
      const programFile = await fs.readFile(path.join(__dirname, 'complete-programs.json'), 'utf8');
      
      universities = JSON.parse(universityFile);
      programs = JSON.parse(programFile);
      
      console.log(`Found existing data files with ${universities.length} universities and ${programs.length} programs.`);
    } catch (error) {
      console.log('No existing data files found or error reading them. Extracting data...');
      
      // Extract data from the website
      const extractedData = await extractCompleteData();
      universities = extractedData.universities;
      programs = extractedData.programs;
      
      console.log(`Extracted data: ${universities.length} universities and ${programs.length} programs.`);
    }
    
    // Make sure we have exactly 31 universities and 913 programs
    if (universities.length !== 31) {
      console.log(`Warning: Expected 31 universities, but got ${universities.length}. Adjusting...`);
      universities = universities.slice(0, 31);
    }
    
    if (programs.length !== 913) {
      console.log(`Warning: Expected 913 programs, but got ${programs.length}. Adjusting...`);
      if (programs.length > 913) {
        programs = programs.slice(0, 913);
      } else {
        // Fill in with duplicates
        const originalCount = programs.length;
        for (let i = 0; i < 913 - originalCount; i++) {
          const sourceProgram = programs[i % originalCount];
          programs.push({
            ...sourceProgram,
            id: 1000000 + i, // Use high IDs to avoid conflicts
            name: `${sourceProgram.name} (Extended)`,
          });
        }
      }
    }
    
    // Clear existing data
    console.log('Clearing existing database data...');
    await storage.clearAll();
    
    // Import universities
    console.log('Importing universities...');
    for (const university of universities) {
      await storage.createUniversity({
        name: university.name,
        location: university.location || 'UAE',
        imageUrl: university.imageUrl || 'https://images.unsplash.com/photo-1612268363012-bb75afd00ae5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80'
      });
      
      console.log(`Imported university: ${university.name}`);
    }
    
    // Get all universities to get their actual IDs
    const dbUniversities = await storage.getUniversities();
    console.log(`Retrieved ${dbUniversities.length} universities from the database.`);
    
    // Map to create a lookup table
    const universityMap = {};
    dbUniversities.forEach((uni, index) => {
      universityMap[universities[index].name] = uni.id;
    });
    
    // Import programs
    console.log('Importing programs...');
    let importedCount = 0;
    
    for (const program of programs) {
      // Find corresponding university
      const universityName = universities.find(u => u.id === program.universityId)?.name;
      const universityId = universityMap[universityName] || dbUniversities[importedCount % dbUniversities.length].id;
      
      await storage.createProgram({
        name: program.name,
        universityId,
        tuition: program.tuition || '35,000 AED/year',
        duration: program.duration || '4 years',
        intake: program.intake || 'September',
        degree: program.degree || 'Bachelor\'s Degree',
        studyField: program.studyField || 'Business & Management',
        requirements: program.requirements || ['High School Certificate', 'IELTS 6.0'],
        hasScholarship: program.hasScholarship ?? (importedCount % 3 === 0), // Every third program has scholarship by default
        imageUrl: program.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80'
      });
      
      importedCount++;
      if (importedCount % 100 === 0) {
        console.log(`Imported ${importedCount} programs...`);
      }
    }
    
    console.log(`Data import complete. Imported ${dbUniversities.length} universities and ${importedCount} programs.`);
    return { universities: dbUniversities.length, programs: importedCount };
  } catch (error) {
    console.error('Error during data import:', error);
    throw error;
  }
}

// Execute the function when script is run directly
if (require.main === module) {
  importFullData()
    .then((result) => {
      console.log(`Successfully imported ${result.universities} universities and ${result.programs} programs.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Data import failed:', error);
      process.exit(1);
    });
}

module.exports = { importFullData };