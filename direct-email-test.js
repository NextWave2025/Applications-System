// Direct email test script
import https from 'https';
import http from 'http';

const data = JSON.stringify({
  email: "abdulramansagir@gmail.com",
  name: "Abdul Rahman"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/test/welcome',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 10000
};

console.log('Testing email send to abdulramansagir@gmail.com...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseBody);
    if (res.statusCode === 200) {
      console.log('✅ Welcome email sent successfully!');
    } else {
      console.log('❌ Email sending failed');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.on('timeout', () => {
  console.error('Request timeout');
  req.destroy();
});

req.write(data);
req.end();