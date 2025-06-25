import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

// Enhanced SendGrid configuration with debugging
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Log SendGrid configuration details (without exposing the actual key)
console.log('SendGrid Configuration:');
console.log('- API Key configured:', !!process.env.SENDGRID_API_KEY);
console.log('- API Key length:', process.env.SENDGRID_API_KEY?.length || 0);
console.log('- API Key starts with:', process.env.SENDGRID_API_KEY?.substring(0, 5) + '...');

// Note: Sandbox mode is controlled via SendGrid dashboard settings

interface EmailParams {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured');
      return false;
    }

    // Using verified SendGrid sender email
    const verifiedSenderEmail = params.from || 'nextwaveadmission@gmail.com';
    
    const msg = {
      to: params.to,
      cc: params.cc,
      from: {
        email: verifiedSenderEmail,
        name: 'NextWave Study Abroad'
      },
      subject: params.subject,
      html: params.html,
      // Add tracking settings
      trackingSettings: {
        clickTracking: {
          enable: true
        },
        openTracking: {
          enable: true
        }
      }
    };

    console.log('=== SendGrid Email Debug Info ===');
    console.log('To:', params.to);
    console.log('From:', verifiedSenderEmail);
    console.log('Subject:', params.subject);
    console.log('HTML length:', params.html.length);
    console.log('API Key configured:', !!process.env.SENDGRID_API_KEY);
    console.log('WARNING: Ensure sender email is verified in SendGrid dashboard');
    
    console.log('Attempting to send email via SendGrid...');
    const result = await sgMail.send(msg);
    
    console.log('=== SendGrid Success Response ===');
    console.log('Status Code:', result[0].statusCode);
    console.log('Response Headers:', JSON.stringify(result[0].headers, null, 2));
    console.log('Message ID:', result[0].headers['x-message-id']);
    console.log(`Email sent successfully to ${params.to}`);
    
    return true;
  } catch (error: any) {
    console.error('=== SendGrid Error Details ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response body:', JSON.stringify(error.response.body, null, 2));
      
      // Detailed error analysis
      if (error.response.body && error.response.body.errors) {
        console.error('SendGrid API Errors:');
        error.response.body.errors.forEach((err: any, index: number) => {
          console.error(`Error ${index + 1}:`, err.message);
          console.error(`Field:`, err.field);
          console.error(`Help:`, err.help);
          
          // Specific guidance for common errors
          if (err.field === 'from' && err.message.includes('verified Sender Identity')) {
            console.error('\n🔧 SOLUTION: Verify your sender email in SendGrid:');
            console.error('1. Login to SendGrid Dashboard');
            console.error('2. Go to Settings > Sender Authentication');
            console.error('3. Add and verify the sender email: ' + verifiedSenderEmail);
            console.error('4. OR use an already verified email address');
          }
        });
      }
    }
    
    console.error('Full error object:', error);
    return false;
  }
}

export interface ApplicationNotificationData {
  applicationId: number;
  studentName: string;
  studentEmail: string;
  agentEmail: string;
  agentName: string;
  programName: string;
  universityName: string;
  status: string;
  previousStatus?: string;
  notes?: string;
  offerLetterUrl?: string;
  conditionalOfferTerms?: string;
  rejectionReason?: string;
}

export async function sendApplicationStatusNotification(data: ApplicationNotificationData): Promise<boolean> {
  const { 
    applicationId, 
    studentName, 
    studentEmail, 
    agentEmail, 
    agentName,
    programName, 
    universityName, 
    status, 
    previousStatus,
    notes,
    offerLetterUrl,
    conditionalOfferTerms,
    rejectionReason
  } = data;

  console.log(`Preparing email notifications for application ${applicationId}`);
  console.log(`Student email: ${studentEmail}, Agent email: ${agentEmail}`);
  console.log(`Status change: ${previousStatus} -> ${status}`);

  const statusMessages = {
    submitted: {
      subject: `Application Submitted - ${programName} at ${universityName}`,
      studentMessage: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Successfully Submitted</h2>
          <p>Dear ${studentName},</p>
          <p>Your application for <strong>${programName}</strong> at <strong>${universityName}</strong> has been successfully submitted.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
            <p><strong>Application ID:</strong> #${applicationId}</p>
            <p><strong>Program:</strong> ${programName}</p>
            <p><strong>University:</strong> ${universityName}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Submitted</span></p>
          </div>
          <p>Your application is now under review. We will keep you updated on any progress.</p>
          <p>If you have any questions, please contact your education consultant: ${agentName}</p>
          <p>Best regards,<br>Study Abroad Team</p>
        </div>
      `,
      agentMessage: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Application Submitted</h2>
          <p>Dear ${agentName},</p>
          <p>A new application has been submitted by ${studentName}.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
            <p><strong>Application ID:</strong> #${applicationId}</p>
            <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
            <p><strong>Program:</strong> ${programName}</p>
            <p><strong>University:</strong> ${universityName}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Submitted</span></p>
          </div>
          <p>Please review the application in your admin dashboard.</p>
          <p>Best regards,<br>Study Abroad System</p>
        </div>
      `
    },
    'under-review': {
      subject: `Application Under Review - ${programName} at ${universityName}`,
      studentMessage: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Under Review</h2>
          <p>Dear ${studentName},</p>
          <p>Your application for <strong>${programName}</strong> at <strong>${universityName}</strong> is now under review.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
            <p><strong>Application ID:</strong> #${applicationId}</p>
            <p><strong>Program:</strong> ${programName}</p>
            <p><strong>University:</strong> ${universityName}</p>
            <p><strong>Status:</strong> <span style="color: #d97706; font-weight: bold;">Under Review</span></p>
          </div>
          ${notes ? `<div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">Additional Notes:</h4>
            <p>${notes}</p>
          </div>` : ''}
          <p>We will notify you once the review process is complete.</p>
          <p>Best regards,<br>Study Abroad Team</p>
        </div>
      `,
      agentMessage: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Status Updated</h2>
          <p>Dear ${agentName},</p>
          <p>Application #${applicationId} for ${studentName} has been updated to "Under Review".</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
            <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
            <p><strong>Program:</strong> ${programName}</p>
            <p><strong>University:</strong> ${universityName}</p>
            <p><strong>Status:</strong> <span style="color: #d97706; font-weight: bold;">Under Review</span></p>
          </div>
          <p>Best regards,<br>Study Abroad System</p>
        </div>
      `
    },
    approved: {
      subject: `🎉 Application Approved - ${programName} at ${universityName}`,
      studentMessage: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Congratulations! Your Application Has Been Approved</h2>
          <p>Dear ${studentName},</p>
          <p>We are delighted to inform you that your application for <strong>${programName}</strong> at <strong>${universityName}</strong> has been <strong>approved</strong>!</p>
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="color: #065f46; margin-top: 0;">Application Details:</h3>
            <p><strong>Application ID:</strong> #${applicationId}</p>
            <p><strong>Program:</strong> ${programName}</p>
            <p><strong>University:</strong> ${universityName}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Approved</span></p>
          </div>
          ${offerLetterUrl ? `<div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">📄 Offer Letter Available</h4>
            <p>Your official offer letter is now available for download.</p>
            <a href="${offerLetterUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Download Offer Letter</a>
          </div>` : ''}
          ${conditionalOfferTerms ? `<div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">📋 Conditional Offer Terms</h4>
            <p>${conditionalOfferTerms}</p>
          </div>` : ''}
          ${notes ? `<div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">Additional Notes:</h4>
            <p>${notes}</p>
          </div>` : ''}
          <p>Please contact your education consultant ${agentName} for next steps regarding enrollment and visa procedures.</p>
          <p>Congratulations once again on this achievement!</p>
          <p>Best regards,<br>Study Abroad Team</p>
        </div>
      `,
      agentMessage: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Application Approved</h2>
          <p>Dear ${agentName},</p>
          <p>Great news! Application #${applicationId} for ${studentName} has been approved.</p>
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">Application Details:</h3>
            <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
            <p><strong>Program:</strong> ${programName}</p>
            <p><strong>University:</strong> ${universityName}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Approved</span></p>
          </div>
          <p>Please follow up with the student for next steps.</p>
          <p>Best regards,<br>Study Abroad System</p>
        </div>
      `
    },
    rejected: {
      subject: `Application Update - ${programName} at ${universityName}`,
      studentMessage: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Application Status Update</h2>
          <p>Dear ${studentName},</p>
          <p>We regret to inform you that your application for <strong>${programName}</strong> at <strong>${universityName}</strong> has not been successful at this time.</p>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #991b1b; margin-top: 0;">Application Details:</h3>
            <p><strong>Application ID:</strong> #${applicationId}</p>
            <p><strong>Program:</strong> ${programName}</p>
            <p><strong>University:</strong> ${universityName}</p>
            <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Not Successful</span></p>
          </div>
          ${rejectionReason ? `<div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">Feedback:</h4>
            <p>${rejectionReason}</p>
          </div>` : ''}
          ${notes ? `<div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">Additional Notes:</h4>
            <p>${notes}</p>
          </div>` : ''}
          <p>Please don't be discouraged. Your education consultant ${agentName} will be in touch to discuss alternative options and next steps.</p>
          <p>Best regards,<br>Study Abroad Team</p>
        </div>
      `,
      agentMessage: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Application Rejected</h2>
          <p>Dear ${agentName},</p>
          <p>Application #${applicationId} for ${studentName} has been rejected.</p>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #991b1b; margin-top: 0;">Application Details:</h3>
            <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
            <p><strong>Program:</strong> ${programName}</p>
            <p><strong>University:</strong> ${universityName}</p>
            <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Rejected</span></p>
          </div>
          <p>Please reach out to the student to discuss alternative options.</p>
          <p>Best regards,<br>Study Abroad System</p>
        </div>
      `
    }
  };

  const templates = statusMessages[status as keyof typeof statusMessages];
  if (!templates) {
    console.log(`No email template found for status: ${status}`);
    return false;
  }

  try {
    console.log(`Sending student notification to: ${studentEmail}`);
    console.log(`Sending agent notification to: ${agentEmail}`);
    
    // Send email to student
    const studentEmailSent = await sendEmail({
      to: studentEmail,
      subject: templates.subject,
      html: templates.studentMessage,
    });

    // Send email to agent
    const agentEmailSent = await sendEmail({
      to: agentEmail,
      subject: templates.subject,
      html: templates.agentMessage,
    });

    console.log(`Email results - Student: ${studentEmailSent}, Agent: ${agentEmailSent}`);
    
    if (!studentEmailSent) {
      console.error(`Failed to send notification to student: ${studentEmail}`);
    }
    
    if (!agentEmailSent) {
      console.error(`Failed to send notification to agent: ${agentEmail}`);
    }

    return studentEmailSent && agentEmailSent;
  } catch (error: any) {
    console.error('Error sending application status notification:', error);
    return false;
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const welcomeHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background-color: #2563eb; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to NextWave</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your Journey to Study Abroad Starts Here</p>
      </div>
      
      <div style="padding: 40px 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Thank you for joining NextWave Admissions, ${userName}!</h2>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          We're excited to have you on board! NextWave is your trusted partner for studying abroad in the UAE, 
          connecting you with top universities and programs across Dubai, Abu Dhabi, Sharjah, and beyond.
        </p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">What's Next?</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li>Browse over 1,000+ programs from 31 top UAE universities</li>
            <li>Use our advanced filters to find your perfect program</li>
            <li>Get personalized guidance from our education consultants</li>
            <li>Apply directly through our streamlined application system</li>
          </ul>
        </div>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="color: #1e40af; margin-top: 0;">Featured Universities</h3>
          <p style="color: #1e40af; margin: 0;">
            Explore programs from leading institutions in Dubai, Abu Dhabi, Sharjah, Ajman, and Ras Al Khaimah. 
            From business and engineering to computer science and healthcare - find your ideal academic path.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://nextwave.ae/programs" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Explore Programs Now
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Need help getting started? Our team is here to assist you every step of the way. 
          Simply reply to this email or contact our support team.
        </p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0; font-size: 14px;">
          © 2025 NextWave Admissions. Empowering students to achieve their dreams of studying abroad.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Welcome to NextWave - Your Study Abroad Journey Begins!',
    html: welcomeHtml
  });
}