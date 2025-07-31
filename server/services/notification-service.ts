import sgMail from "@sendgrid/mail";

// Configure SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

interface NotificationData {
  type: 'application_submitted' | 'application_status_changed' | 'user_created';
  recipient: string;
  data: any;
}

interface ApplicationNotificationData {
  applicantName: string;
  applicantEmail: string;
  programName: string;
  universityName: string;
  status: string;
  submissionDate: string;
  previousStatus?: string;
}

interface UserNotificationData {
  userName: string;
  userEmail: string;
  userRole: string;
  dateCreated: string;
}

class NotificationService {
  private senderEmail = "nextwave@admissionsinuae.com";
  private senderName = "NextWave Admissions Team";

  async sendApplicationSubmittedNotification(data: ApplicationNotificationData) {
    const subject = `New Application Received – ${data.programName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📋 New Application Received</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Application Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #e9ecef;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Applicant Name</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${data.applicantName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Email</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${data.applicantEmail}</td>
              </tr>
              <tr style="background: #e9ecef;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Program</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${data.programName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">University</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${data.universityName}</td>
              </tr>
              <tr style="background: #e9ecef;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Status</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">
                  <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${data.status.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Submission Date</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${data.submissionDate}</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.getPlatformUrl()}/admin/my-applications" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Application
              </a>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px;">
            <p style="margin: 0;">This is an automated notification from NextWave Study Abroad Platform</p>
            <p style="margin: 5px 0 0 0;">
              <a href="${this.getPlatformUrl()}/admin" style="color: #ffffff;">Admin Dashboard</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
New Application Received – ${data.programName}

Application Details:
- Applicant Name: ${data.applicantName}
- Email: ${data.applicantEmail}
- Program: ${data.programName}
- University: ${data.universityName}
- Status: ${data.status.toUpperCase()}
- Submission Date: ${data.submissionDate}

View the application: ${this.getPlatformUrl()}/admin/my-applications

This is an automated notification from NextWave Study Abroad Platform.
    `;

    await this.sendEmail(subject, htmlContent, textContent);
  }

  async sendApplicationStatusChangedNotification(data: ApplicationNotificationData) {
    const subject = `Application Status Updated – ${data.programName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔄 Application Status Updated</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Status Change Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #e9ecef;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Applicant Name</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${data.applicantName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Program</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${data.programName}</td>
              </tr>
              <tr style="background: #e9ecef;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Previous Status</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">
                  <span style="background: #6c757d; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${data.previousStatus?.toUpperCase() || 'N/A'}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">New Status</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">
                  <span style="background: ${this.getStatusColor(data.status)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${data.status.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr style="background: #e9ecef;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Date Changed</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${new Date().toLocaleDateString()}</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.getPlatformUrl()}/admin/my-applications" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Application
              </a>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px;">
            <p style="margin: 0;">This is an automated notification from NextWave Study Abroad Platform</p>
            <p style="margin: 5px 0 0 0;">
              <a href="${this.getPlatformUrl()}/admin" style="color: #ffffff;">Admin Dashboard</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Application Status Updated – ${data.programName}

Status Change Details:
- Applicant Name: ${data.applicantName}
- Program: ${data.programName}
- Previous Status: ${data.previousStatus?.toUpperCase() || 'N/A'}
- New Status: ${data.status.toUpperCase()}
- Date Changed: ${new Date().toLocaleDateString()}

View the application: ${this.getPlatformUrl()}/admin/my-applications

This is an automated notification from NextWave Study Abroad Platform.
    `;

    await this.sendEmail(subject, htmlContent, textContent);
  }

  async sendUserCreatedNotification(data: UserNotificationData) {
    const subject = `New User Account Created – ${data.userName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">👤 New User Account Created</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">User Account Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #e9ecef;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">User Name</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${data.userName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Email</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${data.userEmail}</td>
              </tr>
              <tr style="background: #e9ecef;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Role</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">
                  <span style="background: #17a2b8; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${data.userRole.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #dee2e6;">Date Created</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${data.dateCreated}</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.getPlatformUrl()}/admin/control" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View User Management
              </a>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px;">
            <p style="margin: 0;">This is an automated notification from NextWave Study Abroad Platform</p>
            <p style="margin: 5px 0 0 0;">
              <a href="${this.getPlatformUrl()}/admin" style="color: #ffffff;">Admin Dashboard</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
New User Account Created – ${data.userName}

User Account Details:
- User Name: ${data.userName}
- Email: ${data.userEmail}
- Role: ${data.userRole.toUpperCase()}
- Date Created: ${data.dateCreated}

View user management: ${this.getPlatformUrl()}/admin/control

This is an automated notification from NextWave Study Abroad Platform.
    `;

    await this.sendEmail(subject, htmlContent, textContent);
  }

  async sendSubAdminWelcomeEmail(subAdminData: { name: string; email: string; password: string }) {
    const subject = `Welcome to NextWave Admin Panel – Your Account Details`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Welcome to NextWave Admin Panel</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${subAdminData.name}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Your sub-admin account has been created for the NextWave Study Abroad Platform. 
              You can now access the admin panel to manage applications and user accounts.
            </p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Your Login Credentials</h3>
              <table style="width: 100%; margin: 10px 0;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;">${subAdminData.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Temporary Password:</td>
                  <td style="padding: 8px 0; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 3px;">${subAdminData.password}</td>
                </tr>
              </table>
              <p style="color: #856404; font-size: 14px; margin-bottom: 0;">
                <strong>Important:</strong> Please change your password after your first login for security.
              </p>
            </div>

            <h3 style="color: #495057;">Your Sub-Admin Permissions</h3>
            <ul style="padding-left: 20px;">
              <li>View and manage student applications</li>
              <li>Update application statuses</li>
              <li>View user account details</li>
              <li>Access analytics and reports</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.getPlatformUrl()}/auth?mode=login" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Login to Admin Panel
              </a>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px;">
            <p style="margin: 0;">Welcome to the NextWave team!</p>
            <p style="margin: 5px 0 0 0;">
              If you have any questions, please contact the super admin.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Welcome to NextWave Admin Panel – Your Account Details

Hello ${subAdminData.name}!

Your sub-admin account has been created for the NextWave Study Abroad Platform.

Your Login Credentials:
- Email: ${subAdminData.email}
- Temporary Password: ${subAdminData.password}

IMPORTANT: Please change your password after your first login for security.

Your Sub-Admin Permissions:
- View and manage student applications
- Update application statuses
- View user account details
- Access analytics and reports

Login to Admin Panel: ${this.getPlatformUrl()}/auth?mode=login

Welcome to the NextWave team!
    `;

    await this.sendEmail(subject, htmlContent, textContent, subAdminData.email);
  }

  private async sendEmail(subject: string, htmlContent: string, textContent: string, recipient?: string) {
    if (!apiKey) {
      console.error("SendGrid API key not configured");
      return;
    }

    try {
      // Get admin emails for notifications
      const adminEmails = await this.getAdminEmails();
      const recipients = recipient ? [recipient] : adminEmails;

      if (recipients.length === 0) {
        console.warn("No recipients found for notification email");
        return;
      }

      const msg = {
        to: recipients,
        from: {
          email: this.senderEmail,
          name: this.senderName,
        },
        subject,
        text: textContent,
        html: htmlContent,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@nextwaveadmission.com>',
          'X-Entity-ID': 'nextwave-notifications',
        },
      };

      await sgMail.send(msg);
      console.log(`Notification email sent successfully to: ${recipients.join(', ')}`);
    } catch (error: any) {
      console.error("Error sending notification email:", error);
      
      // Log detailed error information
      if (error?.response) {
        console.error("SendGrid response:", error.response.body);
      }
    }
  }

  private async getAdminEmails(): Promise<string[]> {
    try {
      // Import database connection
      const { db } = await import("../db");
      const { users } = await import("../../shared/schema");
      const { eq, or } = await import("drizzle-orm");

      // Get super admin and sub-admin emails (username is email)
      const admins = await db
        .select({ email: users.username })
        .from(users)
        .where(or(eq(users.role, 'admin'), eq(users.role, 'sub-admin')))
        .execute();

      return admins.map(admin => admin.email);
    } catch (error) {
      console.error("Error fetching admin emails:", error);
      // Fallback to environment variable or default
      return [process.env.ADMIN_EMAIL || this.senderEmail];
    }
  }

  private getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'under-review': return '#ffc107';
      case 'pending': return '#17a2b8';
      default: return '#6c757d';
    }
  }

  private getPlatformUrl(): string {
    // Use environment variable or construct URL based on Replit domain
    if (process.env.REPLIT_DOMAIN) {
      return `https://${process.env.REPLIT_DOMAIN}`;
    }
    return process.env.PLATFORM_URL || 'http://localhost:5000';
  }
}

export const notificationService = new NotificationService();