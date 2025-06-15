import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/admin";

const router = Router();

// Middleware to check admin status
router.use(requireAdmin);

// Get admin statistics
router.get("/stats", async (req, res) => {
  try {
    // Get application counts
    const applications = await storage.getAllApplications();
    const totalApplications = applications.length;
    const pendingReviews = applications.filter(app => 
      app.status === "submitted" || app.status === "under-review"
    ).length;
    const approvedApplications = applications.filter(app => 
      app.status === "approved"
    ).length;

    // Get user counts
    const users = await storage.getAllUsers();
    const activeAgents = users.filter(user => 
      user.role === "agent" && user.active === true
    ).length;

    // Calculate total students (count unique student emails)
    const studentEmails = new Set(applications.map(app => app.studentEmail));
    const totalStudents = studentEmails.size;

    // Get university count
    const universities = await storage.getUniversities();
    const totalUniversities = universities.length;

    res.json({
      totalApplications,
      pendingReviews,
      approvedApplications,
      activeAgents,
      totalStudents,
      totalUniversities
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin statistics" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Activate/deactivate user
router.patch("/users/:id/status", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { active } = z.object({ active: z.boolean() }).parse(req.body);
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Don't allow deactivating admin users
    if (user.role === "admin" && !active) {
      return res.status(403).json({ error: "Cannot deactivate admin users" });
    }
    
    const updatedUser = await storage.updateUserStatus(userId, active);
    
    // Log the action
    await storage.createAuditLog({
      userId: req.user?.id || 0,
      action: active ? "activate_user" : "deactivate_user",
      resourceType: "user",
      resourceId: userId,
      newData: { active, username: user.username }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Get all applications
router.get("/applications", async (req, res) => {
  console.log("Admin applications route called");
  console.log("User:", req.user);
  try {
    console.log("Fetching all applications...");
    const applications = await storage.getAllApplications();
    console.log(`Found ${applications.length} applications`);
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Update application status with enhanced validation and tracking
router.patch("/applications/:id/status", async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const statusUpdateSchema = z.object({
      status: z.string(),
      notes: z.string().optional(),
      rejectionReason: z.string().optional(),
      conditionalOfferTerms: z.string().optional(),
      paymentConfirmation: z.boolean().optional()
    });
    
    const { status, notes, rejectionReason, conditionalOfferTerms, paymentConfirmation } = 
      statusUpdateSchema.parse(req.body);
    
    // Get the current application
    const application = await storage.getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    // Validate status change permissions
    const currentStatus = application.status;
    const adminRoles = ["admin"];
    const isAdmin = adminRoles.includes(req.user?.role || "");
    
    // Import statuses from shared schema
    const { agentControlledStatuses, adminControlledStatuses } = await import("@shared/schema");
    
    // Check if user has permission to change this status
    if (adminControlledStatuses.includes(status as any)) {
      if (!isAdmin) {
        return res.status(403).json({ 
          error: "You don't have permission to change to this status" 
        });
      }
    }
    
    // Validate status-specific requirements
    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({ 
        error: "Rejection reason is required when rejecting an application" 
      });
    }
    
    if (status === "accepted-conditional-offer" && !conditionalOfferTerms) {
      return res.status(400).json({ 
        error: "Conditional offer terms are required" 
      });
    }
    
    // Always require notes for admin status changes
    if (adminControlledStatuses.includes(status as any) && !notes) {
      return res.status(400).json({ 
        error: "Notes are required when changing application status" 
      });
    }
    
    // Update the application status with history tracking
    const updatedApplication = await storage.updateApplicationStatus(
      applicationId, 
      status,
      req.user?.id || 0,
      notes,
      {
        rejectionReason,
        conditionalOfferTerms,
        paymentConfirmation
      }
    );
    
    // Log the action
    await storage.createAuditLog({
      userId: req.user?.id || 0,
      action: "update_application_status",
      resourceType: "application",
      resourceId: applicationId,
      previousData: { status: application.status },
      newData: { 
        status,
        notes,
        rejectionReason: rejectionReason || undefined,
        conditionalOfferTerms: conditionalOfferTerms || undefined,
        paymentConfirmation: paymentConfirmation || undefined
      }
    });
    
    res.json(updatedApplication);
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Failed to update application status" });
  }
});

// Get audit logs
router.get("/audit-logs", async (req, res) => {
  console.log("Admin audit-logs route called");
  console.log("User:", req.user);
  try {
    console.log("Fetching all audit logs...");
    const auditLogs = await storage.getAuditLogs();
    console.log(`Found ${auditLogs.length} audit logs`);
    res.json(auditLogs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// Get audit logs by user ID
router.get("/audit-logs/user/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const auditLogs = await storage.getAuditLogsByUserId(userId);
    res.json(auditLogs);
  } catch (error) {
    console.error("Error fetching user audit logs:", error);
    res.status(500).json({ error: "Failed to fetch user audit logs" });
  }
});

// Get audit logs by resource ID and type
router.get("/audit-logs/resource/:type/:id", async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id);
    const resourceType = req.params.type;
    const auditLogs = await storage.getAuditLogsByTarget(resourceId, resourceType);
    res.json(auditLogs);
  } catch (error) {
    console.error("Error fetching resource audit logs:", error);
    res.status(500).json({ error: "Failed to fetch resource audit logs" });
  }
});

// Get audit logs by action
router.get("/audit-logs/action/:action", async (req, res) => {
  try {
    const action = req.params.action;
    const auditLogs = await storage.getAuditLogsByAction(action);
    res.json(auditLogs);
  } catch (error) {
    console.error("Error fetching action audit logs:", error);
    res.status(500).json({ error: "Failed to fetch action audit logs" });
  }
});

// Get specific application details for admin
router.get("/applications/:id", async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const application = await storage.getApplicationById(applicationId);
    
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    res.json(application);
  } catch (error) {
    console.error("Error fetching application details:", error);
    res.status(500).json({ error: "Failed to fetch application details" });
  }
});

// Send update notification to agent and student
router.post("/applications/:id/send-update", async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { message, hasDocument, documentName } = req.body;
    
    // Get the application to find the agent and student details
    const application = await storage.getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    // Get the agent details
    const agent = await storage.getUserById(application.userId);
    
    // In a real application, you would send actual emails here
    // For now, we'll just log the notification and create an audit entry
    console.log(`Sending update notification for application ${applicationId}:`);
    console.log(`To Agent: ${agent?.username} (${agent?.firstName} ${agent?.lastName})`);
    console.log(`To Student: ${application.studentEmail} (${application.studentFirstName} ${application.studentLastName})`);
    console.log(`Message: ${message}`);
    if (hasDocument) {
      console.log(`Document attached: ${documentName}`);
    }
    
    // Create audit log for the update notification
    await storage.createAuditLog({
      userId: req.user?.id || 0,
      action: "send_application_update",
      resourceType: "application",
      resourceId: applicationId,
      newData: {
        message,
        hasDocument,
        documentName,
        sentToAgent: agent?.username,
        sentToStudent: application.studentEmail
      }
    });
    
    // TODO: Implement actual email sending here
    // Example:
    // await emailService.sendApplicationUpdate({
    //   agentEmail: agent?.username,
    //   studentEmail: application.studentEmail,
    //   applicationId,
    //   message,
    //   hasDocument,
    //   documentName
    // });
    
    res.json({ 
      message: "Update notification sent successfully",
      sentTo: {
        agent: agent?.username,
        student: application.studentEmail
      }
    });
  } catch (error) {
    console.error("Error sending update notification:", error);
    res.status(500).json({ error: "Failed to send update notification" });
  }
});

// University Management Routes
router.get("/universities", async (req, res) => {
  try {
    const universities = await storage.getUniversities();
    res.json(universities);
  } catch (error) {
    console.error("Error fetching universities:", error);
    res.status(500).json({ error: "Failed to fetch universities" });
  }
});

router.post("/universities", async (req, res) => {
  try {
    const universitySchema = z.object({
      name: z.string().min(1, "University name is required"),
      location: z.string().min(1, "Location is required"),
      imageUrl: z.string().url("Valid image URL is required")
    });
    
    const universityData = universitySchema.parse(req.body);
    const university = await storage.createUniversity(universityData);
    
    // Log the action
    await storage.createAuditLog({
      userId: req.user?.id || 0,
      action: "create_university",
      resourceType: "university",
      resourceId: university.id,
      newData: universityData
    });
    
    res.json(university);
  } catch (error) {
    console.error("Error creating university:", error);
    res.status(500).json({ error: "Failed to create university" });
  }
});

router.put("/universities/:id", async (req, res) => {
  try {
    const universityId = parseInt(req.params.id);
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      location: z.string().min(1).optional(),
      imageUrl: z.string().url().optional()
    });
    
    const updateData = updateSchema.parse(req.body);
    
    // Get current university for audit log
    const currentUniversity = await storage.getUniversityById(universityId);
    if (!currentUniversity) {
      return res.status(404).json({ error: "University not found" });
    }
    
    // Update university
    const updatedUniversity = await storage.updateUniversity(universityId, updateData);
    
    // Log the action
    await storage.createAuditLog({
      userId: req.user?.id || 0,
      action: "update_university",
      resourceType: "university",
      resourceId: universityId,
      previousData: currentUniversity,
      newData: updateData
    });
    
    res.json(updatedUniversity);
  } catch (error) {
    console.error("Error updating university:", error);
    res.status(500).json({ error: "Failed to update university" });
  }
});

router.delete("/universities/:id", async (req, res) => {
  try {
    const universityId = parseInt(req.params.id);
    
    // Get current university for audit log
    const currentUniversity = await storage.getUniversityById(universityId);
    if (!currentUniversity) {
      return res.status(404).json({ error: "University not found" });
    }
    
    // Delete university
    await storage.deleteUniversity(universityId);
    
    // Log the action
    await storage.createAuditLog({
      userId: req.user?.id || 0,
      action: "delete_university",
      resourceType: "university",
      resourceId: universityId,
      previousData: currentUniversity
    });
    
    res.json({ message: "University deleted successfully" });
  } catch (error) {
    console.error("Error deleting university:", error);
    res.status(500).json({ error: "Failed to delete university" });
  }
});

// Program Management Routes
router.get("/programs", async (req, res) => {
  try {
    const programs = await storage.getPrograms();
    res.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

router.post("/programs", async (req, res) => {
  try {
    const programSchema = z.object({
      name: z.string().min(1, "Program name is required"),
      universityId: z.number().int().positive(),
      tuition: z.string().min(1, "Tuition is required"),
      duration: z.string().min(1, "Duration is required"),
      intake: z.string().min(1, "Intake is required"),
      degree: z.string().min(1, "Degree is required"),
      studyField: z.string().min(1, "Study field is required"),
      requirements: z.array(z.string()),
      hasScholarship: z.boolean(),
      imageUrl: z.string().url("Valid image URL is required")
    });
    
    const programData = programSchema.parse(req.body);
    const program = await storage.createProgram(programData);
    
    // Log the action
    await storage.createAuditLog({
      userId: req.user?.id || 0,
      action: "create_program",
      resourceType: "program",
      resourceId: program.id,
      newData: programData
    });
    
    res.json(program);
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(500).json({ error: "Failed to create program" });
  }
});

router.put("/programs/:id", async (req, res) => {
  try {
    const programId = parseInt(req.params.id);
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      universityId: z.number().int().positive().optional(),
      tuition: z.string().min(1).optional(),
      duration: z.string().min(1).optional(),
      intake: z.string().min(1).optional(),
      degree: z.string().min(1).optional(),
      studyField: z.string().min(1).optional(),
      requirements: z.array(z.string()).optional(),
      hasScholarship: z.boolean().optional(),
      imageUrl: z.string().url().optional()
    });
    
    const updateData = updateSchema.parse(req.body);
    
    // Get current program for audit log
    const currentProgram = await storage.getProgramById(programId);
    if (!currentProgram) {
      return res.status(404).json({ error: "Program not found" });
    }
    
    // Update program
    const updatedProgram = await storage.updateProgram(programId, updateData);
    
    // Log the action
    await storage.createAuditLog({
      userId: req.user?.id || 0,
      action: "update_program",
      resourceType: "program",
      resourceId: programId,
      previousData: currentProgram,
      newData: updateData
    });
    
    res.json(updatedProgram);
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({ error: "Failed to update program" });
  }
});

router.delete("/programs/:id", async (req, res) => {
  try {
    const programId = parseInt(req.params.id);
    
    // Get current program for audit log
    const currentProgram = await storage.getProgramById(programId);
    if (!currentProgram) {
      return res.status(404).json({ error: "Program not found" });
    }
    
    // Delete program
    await storage.deleteProgram(programId);
    
    // Log the action
    await storage.createAuditLog({
      userId: req.user?.id || 0,
      action: "delete_program",
      resourceType: "program",
      resourceId: programId,
      previousData: currentProgram
    });
    
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ error: "Failed to delete program" });
  }
});

// Get application status history
router.get("/applications/:id/status-history", async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    // Get the application
    const application = await storage.getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    // Return the status history from the application
    const statusHistory = application.statusHistory || [];
    
    // If we need to include user details, we can enhance the response here
    let historyWithUserDetails = [];
    if (Array.isArray(statusHistory)) {
      historyWithUserDetails = await Promise.all(
        statusHistory.map(async (entry: any) => {
          const user = await storage.getUserById(entry.userId);
          return {
            ...entry,
            userDetails: user ? {
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            } : undefined
          };
        })
      );
    }
    
    res.json(historyWithUserDetails);
  } catch (error) {
    console.error("Error fetching application status history:", error);
    res.status(500).json({ error: "Failed to fetch application status history" });
  }
});

export default router;