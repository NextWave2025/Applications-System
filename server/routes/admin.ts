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
    const historyWithUserDetails = await Promise.all(
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
    
    res.json(historyWithUserDetails);
  } catch (error) {
    console.error("Error fetching application status history:", error);
    res.status(500).json({ error: "Failed to fetch application status history" });
  }
});

export default router;