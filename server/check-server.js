/**
 * Simple server health check script
 */
import fetch from 'node-fetch';

async function checkServerStatus() {
  console.log('Checking server status...');
  try {
    // First try to hit the test endpoint
    const testResponse = await fetch('http://localhost:5000/test');
    if (testResponse.ok) {
      console.log('✅ Server is running! Test page is accessible');
      return;
    }
    
    // If that fails, try the API
    const apiResponse = await fetch('http://localhost:5000/api/universities');
    if (apiResponse.ok) {
      const universities = await apiResponse.json();
      console.log(`✅ Server is running! Found ${universities.length} universities in the database`);
      return;
    }
    
    // If both fail, the server may be running but endpoints aren't responding
    console.log('⚠️ Server might be running but endpoints are not responding correctly');
  } catch (error) {
    console.error('❌ Server is not running or not accessible');
    console.error('Error details:', error.message);
  }
}

checkServerStatus();