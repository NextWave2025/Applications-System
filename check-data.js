/**
 * This script checks the current data in the universities and programs tables
 */
import postgres from 'postgres';

// Connect to PostgreSQL database
const client = postgres(process.env.DATABASE_URL);

async function checkData() {
  try {
    // Check university count
    const universities = await client`SELECT COUNT(*) as count FROM universities`;
    console.log(`Universities in database: ${universities[0].count}`);
    
    // Check program count
    const programs = await client`SELECT COUNT(*) as count FROM programs`;
    console.log(`Programs in database: ${programs[0].count}`);
    
    // Get sample data
    if (universities[0].count > 0) {
      const sampleUniversities = await client`SELECT * FROM universities LIMIT 3`;
      console.log('Sample universities:');
      console.log(sampleUniversities);
    }
    
    if (programs[0].count > 0) {
      const samplePrograms = await client`SELECT * FROM programs LIMIT 3`;
      console.log('Sample programs:');
      console.log(samplePrograms);
    }
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await client.end();
  }
}

checkData();