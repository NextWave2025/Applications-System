/**
 * Test script to verify email notification functionality
 */
const { sendApplicationStatusNotification } = require('./server/email-service.ts');

async function testEmailNotification() {
  console.log("Testing email notification system...");
  
  const testData = {
    applicationId: 4,
    studentName: "John Doe",
    studentEmail: "john.doe@example.com",
    agentEmail: "agent@nextwaveadmissions.com",
    agentName: "Test Agent",
    programName: "Computer Science",
    universityName: "Test University",
    status: "under-review",
    previousStatus: "draft",
    notes: "Application is now being reviewed by the admissions team."
  };

  try {
    const result = await sendApplicationStatusNotification(testData);
    console.log("Email notification test result:", result);
    
    if (result) {
      console.log("✓ Email notifications sent successfully");
    } else {
      console.log("✗ Email notifications failed to send");
    }
  } catch (error) {
    console.error("Email notification test failed:", error);
  }
}

testEmailNotification();