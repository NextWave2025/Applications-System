import fetch from 'node-fetch';

const UNIVERSITIES_API_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/api/universities';
const PROGRAMS_API_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/api/programs';

async function testFetch() {
  try {
    console.log('Fetching universities...');
    const universitiesResponse = await fetch(UNIVERSITIES_API_URL);
    if (!universitiesResponse.ok) {
      console.error(`Failed to fetch universities: ${universitiesResponse.statusText}`);
      return;
    }
    
    const universities = await universitiesResponse.json();
    console.log(`Found ${universities.length} universities`);
    if (universities.length > 0) {
      console.log('First university sample:', universities[0]);
    }
    
    console.log('\nFetching programs...');
    const programsResponse = await fetch(PROGRAMS_API_URL);
    if (!programsResponse.ok) {
      console.error(`Failed to fetch programs: ${programsResponse.statusText}`);
      return;
    }
    
    const programs = await programsResponse.json();
    console.log(`Found ${programs.length} programs`);
    if (programs.length > 0) {
      console.log('First program sample:', programs[0]);
    }
    
  } catch (error) {
    console.error('Error during fetch test:', error);
  }
}

testFetch();