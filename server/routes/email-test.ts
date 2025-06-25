import type { Express } from "express";
import { sendEmail, sendApplicationStatusNotification, sendWelcomeEmail } from "../email-service";

export function setupEmailTestRoutes(app: Express) {
  // Test endpoint for basic email sending
  app.post("/api/test/email", async (req, res) => {
    try {
      const { to, subject, message, from } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ 
          error: "Missing required fields: to, subject, message" 
        });
      }

      console.log("Testing email send to:", to);
      
      const result = await sendEmail({
        to,
        from,
        subject: `[TEST] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">SendGrid Test Email</h2>
            <p>${message}</p>
            <p><small>Sent at: ${new Date().toISOString()}</small></p>
            <hr>
            <p><small>This is a test email from the NextWave platform.</small></p>
          </div>
        `
      });

      if (result) {
        res.json({ 
          success: true, 
          message: "Email sent successfully",
          details: "Check the server logs for detailed response information"
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Email failed to send",
          solution: "Check server logs for detailed error information"
        });
      }
    } catch (error: any) {
      console.error("Email test endpoint error:", error);
      res.status(500).json({ 
        error: "Email test failed", 
        details: error?.message || "Unknown error"
      });
    }
  });

  // Test endpoint for application notification
  app.post("/api/test/notification", async (req, res) => {
    try {
      const {
        studentEmail,
        agentEmail,
        status = "under-review"
      } = req.body;
      
      if (!studentEmail || !agentEmail) {
        return res.status(400).json({ 
          error: "Missing required fields: studentEmail, agentEmail" 
        });
      }

      console.log("Testing application notification emails");
      
      const testData = {
        applicationId: 999,
        studentName: "Test Student",
        studentEmail,
        agentEmail,
        agentName: "Test Agent",
        programName: "Computer Science",
        universityName: "Test University",
        status,
        notes: "This is a test notification to verify SendGrid integration"
      };

      const result = await sendApplicationStatusNotification(testData);

      if (result) {
        res.json({ 
          success: true, 
          message: "Application notification emails sent successfully",
          sentTo: [studentEmail, agentEmail]
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Notification emails failed to send"
        });
      }
    } catch (error: any) {
      console.error("Notification test endpoint error:", error);
      res.status(500).json({ 
        error: "Notification test failed", 
        details: error?.message || "Unknown error"
      });
    }
  });

  // Test endpoint for welcome email
  app.post("/api/test/welcome", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          error: "Missing required field: email" 
        });
      }

      const userName = name || "New User";
      console.log(`Testing welcome email to: ${email} for user: ${userName}`);
      
      const result = await sendWelcomeEmail(email, userName);

      if (result) {
        res.json({ 
          success: true, 
          message: "Welcome email sent successfully",
          sentTo: email,
          userName: userName
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Welcome email failed to send"
        });
      }
    } catch (error: any) {
      console.error("Welcome email test endpoint error:", error);
      res.status(500).json({ 
        error: "Welcome email test failed", 
        details: error?.message || "Unknown error"
      });
    }
  });
}