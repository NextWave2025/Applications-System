import axios from 'axios';
import fs from 'fs/promises';

async function testFetch() {
  try {
    const url = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/';
    console.log(`Fetching ${url}...`);
    
    const response = await axios.get(url);
    console.log('Response status:', response.status);
    console.log('Content type:', response.headers['content-type']);
    
    // Save the HTML to a file for inspection
    await fs.writeFile('raw-university-page.html', response.data);
    console.log('HTML saved to raw-university-page.html');
    
    // Output first 500 characters of the response
    console.log('First 500 characters of response:');
    console.log(response.data.substring(0, 500));
    
  } catch (error) {
    console.error('Error fetching website:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testFetch();