import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

async function testUpload() {
  try {
    // Create form data
    const form = new FormData();
    form.append('excel', fs.createReadStream('./test-universities-programs.xlsx'));

    // Make the request
    const response = await fetch('http://localhost:5000/api/admin/upload-excel', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        'Cookie': 'connect.sid=test-session'
      }
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testUpload();