/**
 * Comprehensive SendGrid debugging script
 */
import { sendEmail, sendApplicationStatusNotification } from './server/email-service.js';

async function testSendGridConfiguration() {
  console.log('=== SendGrid Configuration Test ===');
  
  // Test 1: Basic email sending with a real email
  console.log('\n1. Testing basic email functionality...');
  const basicEmailResult = await sendEmail({
    to: 'your-email@example.com', // Replace with your actual email for testing
    subject: 'SendGrid Test Email - NextWave',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">SendGrid Test Email</h1>
        <p>This is a test email from the NextWave Study Abroad platform.</p>
        <p>If you receive this email, SendGrid is working correctly!</p>
        <p>Time: ${new Date().toISOString()}</p>
      </div>
    `
  });
  
  console.log('Basic email test result:', basicEmailResult);
  
  // Test 2: Application notification
  console.log('\n2. Testing application notification...');
  const notificationResult = await sendApplicationStatusNotification({
    applicationId: 999,
    studentName: 'Test Student',
    studentEmail: 'student-test@example.com', // Replace with your email
    agentEmail: 'agent-test@example.com', // Replace with your email
    agentName: 'Test Agent',
    programName: 'Computer Science',
    universityName: 'Test University',
    status: 'under-review',
    notes: 'Testing SendGrid integration for application notifications'
  });
  
  console.log('Application notification test result:', notificationResult);
  
  // Test 3: API Key validation
  console.log('\n3. API Key validation...');
  console.log('API Key exists:', !!process.env.SENDGRID_API_KEY);
  console.log('API Key format check:', process.env.SENDGRID_API_KEY?.startsWith('SG.'));
  console.log('API Key length:', process.env.SENDGRID_API_KEY?.length);
  
  return { basicEmailResult, notificationResult };
}

// Run the test
testSendGridConfiguration()
  .then(results => {
    console.log('\n=== Test Summary ===');
    console.log('Basic email:', results.basicEmailResult ? 'SUCCESS' : 'FAILED');
    console.log('Notification email:', results.notificationResult ? 'SUCCESS' : 'FAILED');
    
    if (!results.basicEmailResult || !results.notificationResult) {
      console.log('\n=== Troubleshooting Tips ===');
      console.log('1. Verify your SendGrid API key is valid');
      console.log('2. Ensure sender domain is verified in SendGrid');
      console.log('3. Check SendGrid account limits and quota');
      console.log('4. Verify recipient email addresses are valid');
    }
  })
  .catch(error => {
    console.error('Test failed with error:', error);
  });