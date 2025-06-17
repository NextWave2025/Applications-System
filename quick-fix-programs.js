import fs from 'fs';
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function quickFixPrograms() {
  try {
    await client.connect();
    
    // Load Excel data
    const excelData = JSON.parse(fs.readFileSync('./extracted-consolidated data.json', 'utf8'));
    
    // Get universities with 0 programs
    const zeroUniversities = [
      { name: 'Murdoch University', id: 13 },
      { name: 'Rochester Institute of Technology', id: 14 },
      { name: 'Symbiosis International University', id: 15 },
      { name: 'Synergy University', id: 16 },
      { name: 'Stirling University', id: 17 },
      { name: 'University of Bolton (Ras Al Khaima)', id: 18 },
      { name: 'University of Wollongong', id: 19 },
      { name: 'Westford University College', id: 20 },
      { name: 'UK College', id: 21 },
      { name: 'SAE University College', id: 22 },
      { name: '360 Institute', id: 23 },
      { name: 'EMDI', id: 24 },
      { name: 'Skyline University', id: 28 },
      { name: 'Learner\'s College', id: 29 },
      { name: 'Abu Dhabi University', id: 30 },
      { name: 'University of Dubai', id: 330 },
      { name: 'RAK Dental College', id: 331 },
      { name: 'Citi University', id: 332 },
      { name: 'University of Europe for Applied Sciences', id: 333 }
    ];

    let totalInserted = 0;

    for (const university of zeroUniversities) {
      // Get programs for this university from Excel
      const universityPrograms = excelData.filter(row => row['University name'] === university.name);
      
      console.log(`Processing ${university.name}: ${universityPrograms.length} programs`);
      
      for (const program of universityPrograms) {
        const programName = program['Name of Degree'];
        if (!programName) continue;

        // Check if program already exists
        const existing = await client.query(
          'SELECT id FROM programs WHERE university_id = $1 AND name = $2',
          [university.id, programName]
        );

        if (existing.rows.length === 0) {
          // Insert program
          await client.query(`
            INSERT INTO programs (
              name, university_id, degree, intake, 
              requirements, tuition, duration, study_field, image_url, has_scholarship
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            programName,
            university.id,
            program['Degree Level'] || 'Bachelor',
            program['Intakes'] || 'September',
            JSON.stringify([program['General Entry Requirements'] || 'Standard entry requirements apply']),
            'Contact university for details',
            'Standard duration',
            'General Studies',
            '/api/placeholder/400/300',
            false
          ]);
          totalInserted++;
        }
      }
    }

    console.log(`Successfully inserted ${totalInserted} programs`);

    // Show final counts
    const finalCounts = await client.query(`
      SELECT u.name, COUNT(p.id) as program_count 
      FROM universities u 
      LEFT JOIN programs p ON u.id = p.university_id 
      GROUP BY u.id, u.name 
      ORDER BY program_count DESC
    `);

    console.log('\nFinal program counts:');
    finalCounts.rows.forEach(row => {
      console.log(`${row.name}: ${row.program_count}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

quickFixPrograms();