import fetch from 'node-fetch';

async function testFetch() {
  try {
    // Get universities
    console.log('Fetching universities...');
    const uniResponse = await fetch('http://localhost:5000/api/universities');
    
    if (!uniResponse.ok) {
      console.error(`Universities API error: ${uniResponse.status} ${uniResponse.statusText}`);
    } else {
      const universities = await uniResponse.json();
      console.log(`Successfully fetched ${universities.length} universities`);
      console.log('First 3 universities:');
      universities.slice(0, 3).forEach(uni => {
        console.log(`- ${uni.name} (${uni.location})`);
      });
    }
    
    // Get programs
    console.log('\nFetching programs...');
    const programResponse = await fetch('http://localhost:5000/api/programs');
    
    if (!programResponse.ok) {
      console.error(`Programs API error: ${programResponse.status} ${programResponse.statusText}`);
    } else {
      const programs = await programResponse.json();
      console.log(`Successfully fetched ${programs.length} programs`);
      console.log('First 3 programs:');
      programs.slice(0, 3).forEach(program => {
        console.log(`- ${program.name} (${program.degree})`);
      });
    }
    
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testFetch();