import fs from 'fs';
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function completeRemainingPrograms() {
  try {
    await client.connect();
    
    const excelData = JSON.parse(fs.readFileSync('./extracted-consolidated data.json', 'utf8'));
    
    // Focus only on universities still showing 0 programs
    const remainingUniversities = [
      { name: 'University of Europe for Applied Sciences', id: 333 },
      { name: 'RAK Dental College', id: 331 },
      { name: 'EMDI', id: 24 },
      { name: '360 Institute', id: 23 },
      { name: 'University of Dubai', id: 330 },
      { name: 'Learner\'s College', id: 29 },
      { name: 'Abu Dhabi University', id: 30 },
      { name: 'UK College', id: 21 },
      { name: 'SAE University College', id: 22 },
      { name: 'Skyline University', id: 28 },
      { name: 'Citi University', id: 332 }
    ];

    let totalInserted = 0;

    for (const university of remainingUniversities) {
      const universityPrograms = excelData.filter(row => row['University name'] === university.name);
      
      console.log(`Inserting ${universityPrograms.length} programs for ${university.name}`);
      
      for (const program of universityPrograms) {
        const programName = program['Name of Degree'];
        if (!programName) continue;

        try {
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
        } catch (error) {
          if (!error.message.includes('duplicate')) {
            console.error(`Error inserting ${programName}:`, error.message);
          }
        }
      }
    }

    console.log(`Inserted ${totalInserted} additional programs`);

    // Final verification
    const finalResult = await client.query(`
      SELECT COUNT(*) as total_programs FROM programs;
    `);
    
    const zeroCount = await client.query(`
      SELECT COUNT(*) as zero_universities 
      FROM (SELECT u.id FROM universities u 
            LEFT JOIN programs p ON u.id = p.university_id 
            GROUP BY u.id 
            HAVING COUNT(p.id) = 0) as zero_unis;
    `);

    console.log(`\nFinal status:`);
    console.log(`Total programs in database: ${finalResult.rows[0].total_programs}`);
    console.log(`Universities with 0 programs: ${zeroCount.rows[0].zero_universities}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

completeRemainingPrograms();