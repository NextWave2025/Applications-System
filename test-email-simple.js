/**
 * Simple SendGrid email test using direct API approach
 */
import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY not found');
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testSendGridDirect() {
  console.log('=== Direct SendGrid Test ===');
  console.log('API Key configured:', !!process.env.SENDGRID_API_KEY);
  console.log('API Key format:', process.env.SENDGRID_API_KEY?.startsWith('SG.'));
  
  const msg = {
    to: 'test@example.com', // Replace with your email
    from: 'noreply@nextwave.ae', // Must be verified in SendGrid
    subject: 'SendGrid Direct Test',
    text: 'This is a test email from SendGrid direct API',
    html: '<h1>Test Email</h1><p>SendGrid is working correctly!</p>',
  };

  try {
    console.log('\nSending email...');
    console.log('To:', msg.to);
    console.log('From:', msg.from);
    console.log('Subject:', msg.subject);
    
    const result = await sgMail.send(msg);
    
    console.log('\n=== SUCCESS ===');
    console.log('Status Code:', result[0].statusCode);
    console.log('Message ID:', result[0].headers['x-message-id']);
    console.log('Email sent successfully!');
    
    return true;
  } catch (error) {
    console.log('\n=== ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', JSON.stringify(error.response.body, null, 2));
    }
    
    // Common error analysis
    if (error.code === 401) {
      console.log('\n🔑 AUTH ERROR: Check your API key');
    } else if (error.code === 403) {
      console.log('\n📧 SENDER ERROR: Verify your sender email in SendGrid');
    }
    
    return false;
  }
}

testSendGridDirect();