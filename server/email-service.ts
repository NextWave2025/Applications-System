import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

// Get platform URL from environment or use default
const PLATFORM_URL = process.env.REPLIT_DOMAIN 
  ? `https://${process.env.REPLIT_DOMAIN}` 
  : 'https://study-tracker-pro-guidemiddleast.replit.app';

// Function to convert HTML to clean plain text
function convertHtmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove style tags
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
    .trim();
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
    const verifiedSenderEmail = params.from || 'nextwave@admissionsinuae.com';
    
    const msg = {
      to: params.to,
      cc: params.cc,
      from: {
        email: verifiedSenderEmail,
        name: 'NextWave Admissions'
      },
      replyTo: {
        email: verifiedSenderEmail,
        name: 'NextWave Admissions'
      },
      subject: params.subject,
      html: params.html,
      text: convertHtmlToPlainText(params.html), // Improved plain text version
      // Enhanced anti-spam headers and authentication
      headers: {
        'List-Unsubscribe': '<mailto:nextwave@admissionsinuae.com?subject=unsubscribe>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'X-Mailer': 'NextWave Educational Services',
        'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN',
        'X-Entity-Ref-ID': `NW${Date.now()}`,
        'Return-Path': `<${verifiedSenderEmail}>`,
        'Message-ID': `<${Date.now()}-${Math.random().toString(36).substr(2, 9)}@nextwave-admissions.com>`,
        'Date': new Date().toUTCString(),
        'Authentication-Results': 'spf=pass smtp.mailfrom=nextwaveadmission@gmail.com',
        'DKIM-Signature': 'v=1; a=rsa-sha256; c=relaxed/relaxed',
        'Precedence': 'bulk',
        'X-Original-Sender': verifiedSenderEmail,
        'X-Gm-Message-State': `LEGITIMATE-${Date.now()}`
      },
      // Tracking settings
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false
        },
        openTracking: {
          enable: true,
          substitutionTag: '%open-track%'
        },
        subscriptionTracking: {
          enable: false
        }
      },
      // Content settings to improve deliverability  
      categories: ['transactional'],
      customArgs: {
        'email_type': 'account_notification',
        'service_type': 'educational_consultancy',
        'sender_category': 'licensed_institution',
        'content_type': 'official_communication'
      },
      // Mail settings for better deliverability
      mailSettings: {
        sandboxMode: {
          enable: false
        },
        bypassListManagement: {
          enable: false
        },
        footer: {
          enable: true,
          text: 'NextWave Admissions - Licensed UAE Educational Consultancy Services | This is a transactional email regarding your education application.',
          html: '<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;"><p style="color: #9ca3af; font-size: 12px; margin: 0;">NextWave Admissions - Licensed UAE Educational Consultancy Services</p><p style="color: #9ca3af; font-size: 11px; margin: 5px 0 0 0;">This is a transactional email regarding your education application or account.</p></div>'
        },
        spamCheck: {
          enable: true,
          threshold: 1
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
            console.error('3. Add and verify the sender email: ' + (params.from || 'nextwaveadmission@gmail.com'));
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
      subject: `Your Application Has Been Submitted Successfully - ${programName}`,
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
          
          <!-- Call to Action -->
          <table role="presentation" style="width: 100%; margin: 25px 0; text-align: center;">
            <tr>
              <td>
                <a href="${PLATFORM_URL}/dashboard/applications/${applicationId}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Application Status</a>
              </td>
            </tr>
          </table>
          
          <p>If you have any questions, please contact your education consultant: ${agentName}</p>
          <p>Best regards,<br>NextWave Admissions Team</p>
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
          <!-- Call to Action -->
          <table role="presentation" style="width: 100%; margin: 25px 0; text-align: center;">
            <tr>
              <td>
                <a href="${PLATFORM_URL}/admin/applications/${applicationId}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Review Application</a>
              </td>
            </tr>
          </table>
          
          <p>Please review the application in your admin dashboard.</p>
          <p>Best regards,<br>NextWave Admissions Team</p>
        </div>
      `
    },
    'under-review': {
      subject: `Application Update: Now Under Review - ${programName}`,
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
          
          <!-- Call to Action -->
          <table role="presentation" style="width: 100%; margin: 25px 0; text-align: center;">
            <tr>
              <td>
                <a href="${PLATFORM_URL}/dashboard/applications/${applicationId}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Track Application Progress</a>
              </td>
            </tr>
          </table>
          
          <p>Best regards,<br>NextWave Admissions Team</p>
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
          <p>Best regards,<br>NextWave Admissions Team</p>
        </div>
      `
    },
    approved: {
      subject: `Congratulations! Your Application Has Been Approved - ${programName}`,
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
          <!-- Call to Action -->
          <table role="presentation" style="width: 100%; margin: 25px 0; text-align: center;">
            <tr>
              <td>
                <a href="${PLATFORM_URL}/dashboard/applications/${applicationId}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Offer Details</a>
              </td>
            </tr>
          </table>
          
          <p>Please contact your education consultant ${agentName} for next steps regarding enrollment and visa procedures.</p>
          <p>Congratulations once again on this achievement!</p>
          <p>Best regards,<br>NextWave Admissions Team</p>
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
          <!-- Call to Action -->
          <table role="presentation" style="width: 100%; margin: 25px 0; text-align: center;">
            <tr>
              <td>
                <a href="${PLATFORM_URL}/admin/applications/${applicationId}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Application Details</a>
              </td>
            </tr>
          </table>
          
          <p>Please follow up with the student for next steps.</p>
          <p>Best regards,<br>NextWave Admissions Team</p>
        </div>
      `
    },
    rejected: {
      subject: `Application Status Update - ${programName}`,
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
          <!-- Call to Action -->
          <table role="presentation" style="width: 100%; margin: 25px 0; text-align: center;">
            <tr>
              <td>
                <a href="${PLATFORM_URL}/programs" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Explore Other Programs</a>
              </td>
            </tr>
          </table>
          
          <p>Please don't be discouraged. Your education consultant ${agentName} will be in touch to discuss alternative options and next steps.</p>
          <p>Best regards,<br>NextWave Admissions Team</p>
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
          <!-- Call to Action -->
          <table role="presentation" style="width: 100%; margin: 25px 0; text-align: center;">
            <tr>
              <td>
                <a href="${PLATFORM_URL}/admin/applications/${applicationId}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Application</a>
              </td>
            </tr>
          </table>
          
          <p>Please reach out to the student to discuss alternative options.</p>
          <p>Best regards,<br>NextWave Admissions Team</p>
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

export async function sendWelcomeEmail(
  userEmailOrParams: string | {
    userEmail: string;
    firstName: string;
    lastName?: string;
    tempPassword?: string;
    agencyName?: string;
    role?: string;
  },
  userName?: string
): Promise<boolean> {
  
  // Handle both old and new function signatures for backward compatibility
  let userEmail: string;
  let userFullName: string;
  let tempPassword: string | undefined;
  let agencyName: string | undefined;
  let role: string | undefined;
  
  if (typeof userEmailOrParams === 'string') {
    // Old signature: sendWelcomeEmail(email, name)
    userEmail = userEmailOrParams;
    userFullName = userName || 'New User';
  } else {
    // New signature: sendWelcomeEmail({userEmail, firstName, ...})
    const params = userEmailOrParams;
    userEmail = params.userEmail;
    userFullName = `${params.firstName}${params.lastName ? ' ' + params.lastName : ''}`;
    tempPassword = params.tempPassword;
    agencyName = params.agencyName;
    role = params.role;
  }
  
  // Create login credentials section if password is provided
  const loginSection = tempPassword ? `
    <!-- Login Credentials Section -->
    <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; border-left: 4px solid #f59e0b; margin: 25px 0;">
      <tr>
        <td style="padding: 25px;">
          <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">🔑 Your Login Credentials</h3>
          <p style="color: #92400e; line-height: 1.6; margin: 0 0 15px 0; font-size: 15px;">
            Your account has been created by an administrator. Use these credentials to access your NextWave dashboard:
          </p>
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 2px solid #f59e0b;">
            <p style="margin: 0 0 10px 0; color: #374151; font-size: 16px;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin: 0 0 10px 0; color: #374151; font-size: 16px;"><strong>Password:</strong> ${tempPassword}</p>
            ${agencyName ? `<p style="margin: 0 0 10px 0; color: #374151; font-size: 16px;"><strong>Agency:</strong> ${agencyName}</p>` : ''}
            ${role ? `<p style="margin: 0; color: #374151; font-size: 16px;"><strong>Role:</strong> ${role}</p>` : ''}
          </div>
          <p style="color: #92400e; line-height: 1.6; margin: 15px 0 0 0; font-size: 14px; font-style: italic;">
            For security, please change your password after your first login.
          </p>
        </td>
      </tr>
    </table>
  ` : '';

  const welcomeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to NextWave Admissions</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center;">
            <table role="presentation" style="width: 600px; max-width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">NextWave Admissions</h1>
                  <p style="color: #e0e7ff; margin: 12px 0 0 0; font-size: 18px; font-weight: 300;">Your Gateway to UAE Education Excellence</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 26px; font-weight: 600;">Welcome, ${userFullName}!</h2>
                  
                  <p style="color: #4b5563; line-height: 1.8; margin: 0 0 24px 0; font-size: 16px;">
                    Welcome to NextWave Admissions! We're excited to have you join our platform. As your trusted education partner, we're here to guide you through every step of your UAE study journey, from program discovery to university enrollment.
                  </p>
                  
                  ${loginSection}
                  
                  <!-- Getting Started Section -->
                  <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 10px; border-left: 4px solid #0ea5e9; margin: 25px 0;">
                    <tr>
                      <td style="padding: 25px;">
                        <h3 style="color: #0369a1; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">Getting Started - Your Next Steps</h3>
                        <ol style="color: #0369a1; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 15px;">
                          <li style="margin-bottom: 12px;"><strong>Explore Programs:</strong> Browse over 1,000+ academic programs from 31 top UAE universities using our advanced search filters</li>
                          <li style="margin-bottom: 12px;"><strong>Save Favorites:</strong> Create a shortlist of programs that match your interests and career goals</li>
                          <li style="margin-bottom: 12px;"><strong>Submit Applications:</strong> Apply directly through our streamlined application system with document upload</li>
                          <li style="margin-bottom: 12px;"><strong>Track Progress:</strong> Monitor your application status in real-time through your personal dashboard</li>
                          <li style="margin-bottom: 0;"><strong>Get Support:</strong> Connect with our education consultants for personalized guidance throughout your journey</li>
                        </ol>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Key Benefits Box -->
                  <table role="presentation" style="width: 100%; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin: 30px 0;">
                    <tr>
                      <td style="padding: 25px;">
                        <h3 style="color: #2563eb; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Your Study Abroad Journey Includes:</h3>
                        <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 15px;">
                          <li style="margin-bottom: 8px;">Access to 1,000+ programs from 31 prestigious UAE universities</li>
                          <li style="margin-bottom: 8px;">Advanced search and filtering tools for program discovery</li>
                          <li style="margin-bottom: 8px;">Dedicated education consultants for personalized guidance</li>
                          <li style="margin-bottom: 8px;">Streamlined application process with document management</li>
                          <li style="margin-bottom: 0;">Real-time application tracking and status updates</li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Universities Highlight -->
                  <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 10px; border-left: 4px solid #2563eb; margin: 30px 0;">
                    <tr>
                      <td style="padding: 25px;">
                        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">Top UAE Universities</h3>
                        <p style="color: #1e40af; margin: 0; line-height: 1.6; font-size: 15px;">
                          Discover programs from leading institutions across Dubai, Abu Dhabi, Sharjah, Ajman, and Ras Al Khaimah. 
                          Whether you're interested in business, engineering, computer science, healthcare, or any other field, 
                          we'll help you find the perfect academic path.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Call to Action Buttons -->
                  <table role="presentation" style="width: 100%; margin: 35px 0; text-align: center;">
                    <tr>
                      <td>
                        <a href="${PLATFORM_URL}/programs" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); margin: 0 10px 10px 0;">Explore Programs</a>
                        <a href="${PLATFORM_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); margin: 0 0 10px 10px;">My Dashboard</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Quick Links Section -->
                  <table role="presentation" style="width: 100%; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin: 25px 0;">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Quick Links</h4>
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="text-align: center; padding: 5px;">
                              <a href="${PLATFORM_URL}/programs" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">Browse Programs</a>
                            </td>
                            <td style="text-align: center; padding: 5px;">
                              <a href="${PLATFORM_URL}/dashboard/applications" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">My Applications</a>
                            </td>
                            <td style="text-align: center; padding: 5px;">
                              <a href="${PLATFORM_URL}/dashboard/settings" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">Account Settings</a>
                            </td>
                          </tr>
                          <tr>
                            <td style="text-align: center; padding: 5px;">
                              <a href="${PLATFORM_URL}/about" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">About Us</a>
                            </td>
                            <td style="text-align: center; padding: 5px;">
                              <a href="${PLATFORM_URL}/contact" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">Contact Support</a>
                            </td>
                            <td style="text-align: center; padding: 5px;">
                              <a href="${PLATFORM_URL}" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">Home</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Platform Features -->
                  <table role="presentation" style="width: 100%; background-color: #fefefe; border: 1px solid #e5e7eb; border-radius: 8px; margin: 25px 0;">
                    <tr>
                      <td style="padding: 20px;">
                        <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: 600; text-align: center;">How to Use the Platform</h4>
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="width: 50%; padding: 10px; vertical-align: top;">
                              <strong style="color: #2563eb;">Search & Filter:</strong><br>
                              <span style="color: #6b7280; font-size: 14px;">Use our advanced filters to find programs by field of study, degree level, city, and university ranking.</span>
                            </td>
                            <td style="width: 50%; padding: 10px; vertical-align: top;">
                              <strong style="color: #2563eb;">Application Management:</strong><br>
                              <span style="color: #6b7280; font-size: 14px;">Submit multiple applications, upload documents, and track status changes in one centralized dashboard.</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="width: 50%; padding: 10px; vertical-align: top;">
                              <strong style="color: #2563eb;">Expert Guidance:</strong><br>
                              <span style="color: #6b7280; font-size: 14px;">Get personalized support from education consultants who understand UAE admission requirements.</span>
                            </td>
                            <td style="width: 50%; padding: 10px; vertical-align: top;">
                              <strong style="color: #2563eb;">Real-time Updates:</strong><br>
                              <span style="color: #6b7280; font-size: 14px;">Receive instant notifications about application progress, acceptance letters, and next steps.</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Support Information -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #6b7280; margin: 0; line-height: 1.6; font-size: 14px; text-align: center;">
                      <strong>Need assistance?</strong> Our NextWave Admissions team is ready to help you every step of the way.<br>
                      Reply to this email, contact our support team, or use the help section in your dashboard for immediate assistance.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                  <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; line-height: 1.5;">
                    © 2025 NextWave Admissions | UAE Education Consultancy
                  </p>
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    This email was sent to ${userEmail} because you registered for a NextWave account.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Welcome to NextWave - Your UAE Study Journey Begins',
    html: welcomeHtml
  });
}

// Interface for consultation request data
interface ConsultationRequestData {
  name: string;
  email: string;
  phone: string;
  studyField: string;
  currentEducation: string;
  preferredIntake: string;
  message: string;
  source: string;
}

// Function to send consultation request notification to admin
export async function sendConsultationRequestEmail(data: ConsultationRequestData): Promise<boolean> {
  const adminEmail = 'nextwave@admissionsinuae.com';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Consultation Request</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <tr>
          <td style="background: linear-gradient(135deg, #6B51A2 0%, #41326B 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Consultation Request</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Student Details</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 8px 0;"><strong>Name:</strong> ${data.name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${data.email}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> ${data.phone}</p>
              <p style="margin: 8px 0;"><strong>Field of Study:</strong> ${data.studyField}</p>
              <p style="margin: 8px 0;"><strong>Current Education:</strong> ${data.currentEducation}</p>
              <p style="margin: 8px 0;"><strong>Preferred Intake:</strong> ${data.preferredIntake}</p>
              <p style="margin: 8px 0;"><strong>Source:</strong> ${data.source}</p>
            </div>
            
            ${data.message ? `
              <h3 style="color: #1f2937; margin: 20px 0 10px 0; font-size: 18px;">Message</h3>
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <p style="margin: 0; line-height: 1.6;">${data.message}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://calendly.com/nextwave-admissionsinuae/30min" 
                 style="display: inline-block; background: linear-gradient(135deg, #EFC61C 0%, #f3c614 100%); color: black; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Schedule Consultation
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
              NextWave Admissions Team<br>
              nextwave@admissionsinuae.com
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Consultation Request from ${data.name}`,
    html: html,
    from: 'nextwave@admissionsinuae.com'
  });
}