import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/admin";
import multer from "multer";
import * as XLSX from "xlsx";
import path from "path";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
});

// Middleware to check admin status
router.use(requireAdmin);

// Get admin statistics
router.get("/stats", async (req, res) => {
  console.log("Admin stats route called");
  console.log("User:", req.user);
  try {
    console.log("Fetching applications...");
    // Get application counts
    const applications = await storage.getAllApplications();
    console.log(`Found ${applications.length} applications`);
    const totalApplications = applications.length;
    const pendingReviews = applications.filter(app => 
      app.status === "submitted" || app.status === "under-review"
    ).length;
    const approvedApplications = applications.filter(app => 
      app.status === "approved"
    ).length;

    console.log("Fetching users...");
    // Get user counts
    const users = await storage.getAllUsers();
    console.log(`Found ${users.length} users`);
    const activeAgents = users.filter(user => 
      user.role === "agent" && user.active === true
    ).length;

    // Calculate total students (count unique student emails)
    const studentEmails = new Set(applications.map(app => app.studentEmail));
    const totalStudents = studentEmails.size;

    console.log("Fetching universities...");
    // Get university count
    const universities = await storage.getUniversities();
    console.log(`Found ${universities.length} universities`);
    const totalUniversities = universities.length;

    const stats = {
      totalApplications,
      pendingReviews,
      approvedApplications,
      activeAgents,
      totalStudents,
      totalUniversities
    };
    
    console.log("Sending stats:", stats);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin statistics" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  console.log("Admin users route called");
  console.log("User:", req.user);
  try {
    console.log("Fetching all users...");
    const users = await storage.getAllUsers();
    console.log(`Found ${users.length} users`);
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

// Excel Upload Route
router.post("/upload-excel", upload.single("excel"), async (req, res) => {
  try {
    console.log("Excel upload started");
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File received:", {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    console.log("Workbook parsed, sheet names:", workbook.SheetNames);
    
    let universitiesCreated = 0;
    let universitiesUpdated = 0;
    let programsCreated = 0;
    let programsUpdated = 0;
    const errors: string[] = [];

    // Check for sheet names with flexible matching
    const universitySheetNames = ["Universities", "University", "UNIVERSITIES", "universities", "university"];
    const programSheetNames = ["Programs", "Program", "PROGRAMS", "programs", "program"];
    const consolidatedSheetNames = ["Consolidated Data", "Consolidated", "Data", "All Data"];
    
    const foundUniversitySheet = universitySheetNames.find(name => workbook.SheetNames.includes(name));
    const foundProgramSheet = programSheetNames.find(name => workbook.SheetNames.includes(name));
    const foundConsolidatedSheet = consolidatedSheetNames.find(name => workbook.SheetNames.includes(name));
    
    console.log("Available sheet names:", workbook.SheetNames);
    console.log("Found university sheet:", foundUniversitySheet);
    console.log("Found program sheet:", foundProgramSheet);
    console.log("Found consolidated sheet:", foundConsolidatedSheet);

    // Process Universities sheet
    if (foundUniversitySheet) {
      console.log("Processing Universities sheet:", foundUniversitySheet);
      const universitiesSheet = workbook.Sheets[foundUniversitySheet];
      const universitiesData = XLSX.utils.sheet_to_json(universitiesSheet);
      console.log("Universities data parsed:", universitiesData.length, "rows");
      console.log("First few rows:", universitiesData.slice(0, 3));

      for (let i = 0; i < universitiesData.length; i++) {
        const row = universitiesData[i] as any;
        try {
          if (!row.name || !row.location) {
            errors.push(`Row ${i + 2} in Universities sheet: Missing required fields (name, location)`);
            continue;
          }

          // Check if university already exists
          const existingUniversities = await storage.getUniversities();
          const existingUniversity = existingUniversities.find(u => 
            u.name.toLowerCase() === row.name.toLowerCase()
          );

          const universityData = {
            name: row.name,
            location: row.location,
            imageUrl: row.imageUrl || row.logo || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
          };

          if (existingUniversity) {
            await storage.updateUniversity(existingUniversity.id, universityData);
            universitiesUpdated++;
          } else {
            await storage.createUniversity(universityData);
            universitiesCreated++;
          }
        } catch (error: any) {
          errors.push(`Row ${i + 2} in Universities sheet: ${error?.message || 'Unknown error'}`);
        }
      }
    } else {
      console.log("No Universities sheet found in sheets:", workbook.SheetNames);
    }

    // Process Programs sheet
    if (foundProgramSheet) {
      console.log("Processing Programs sheet:", foundProgramSheet);
      const programsSheet = workbook.Sheets[foundProgramSheet];
      const programsData = XLSX.utils.sheet_to_json(programsSheet);
      console.log("Programs data parsed:", programsData.length, "rows");
      console.log("First few program rows:", programsData.slice(0, 3));
      
      // Get updated universities list
      const universities = await storage.getUniversities();
      const universityMap = new Map(universities.map(u => [u.name.toLowerCase(), u.id]));
      console.log("University mapping created:", universityMap.size, "universities");

      for (let i = 0; i < programsData.length; i++) {
        const row = programsData[i] as any;
        try {
          if (!row.name || !row.universityName) {
            errors.push(`Row ${i + 2} in Programs sheet: Missing required fields (name, universityName)`);
            continue;
          }

          const universityId = universityMap.get(row.universityName.toLowerCase());
          if (!universityId) {
            errors.push(`Row ${i + 2} in Programs sheet: University "${row.universityName}" not found`);
            continue;
          }

          // Parse requirements if it's a string
          let requirements = [];
          if (row.requirements) {
            if (typeof row.requirements === 'string') {
              requirements = row.requirements.split(',').map((req: string) => req.trim()).filter((req: string) => req);
            } else if (Array.isArray(row.requirements)) {
              requirements = row.requirements;
            }
          }

          // Check if program already exists
          const existingPrograms = await storage.getPrograms();
          const existingProgram = existingPrograms.find(p => 
            p.name.toLowerCase() === row.name.toLowerCase() && 
            p.universityId === universityId
          );

          const programData = {
            name: row.name,
            universityId: universityId,
            tuition: row.tuition || row.fees || '0 AED/year',
            duration: row.duration || '1 year',
            intake: row.intake || 'September',
            degree: row.degree || row.level || "Bachelor's Degree",
            studyField: row.studyField || row.field || 'General Studies',
            requirements: requirements,
            hasScholarship: Boolean(row.hasScholarship || row.scholarship),
            imageUrl: row.imageUrl || row.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
          };

          if (existingProgram) {
            await storage.updateProgram(existingProgram.id, programData);
            programsUpdated++;
          } else {
            await storage.createProgram(programData);
            programsCreated++;
          }
        } catch (error: any) {
          errors.push(`Row ${i + 2} in Programs sheet: ${error?.message || 'Unknown error'}`);
        }
      }
    }

    // Log the action
    await storage.createAuditLog({
      userId: req.user?.id || 0,
      action: "bulk_upload_excel",
      resourceType: "system",
      resourceId: 0,
      newData: {
        universitiesCreated,
        universitiesUpdated,
        programsCreated,
        programsUpdated,
        errorsCount: errors.length
      }
    });

    res.json({
      message: "Excel file processed successfully",
      universitiesCreated,
      universitiesUpdated,
      programsCreated,
      programsUpdated,
      errors
    });

  } catch (error) {
    console.error("Error processing Excel file:", error);
    res.status(500).json({ error: "Failed to process Excel file" });
  }
});

// Excel Template Download Route
router.get("/download-excel-template", async (req, res) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Universities template
    const universitiesTemplate = [
      {
        name: "Example University",
        location: "Dubai, UAE",
        imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      }
    ];

    // Programs template
    const programsTemplate = [
      {
        name: "Bachelor of Business Administration",
        universityName: "Example University",
        tuition: "45000 AED/year",
        duration: "4 years",
        intake: "September",
        degree: "Bachelor's Degree",
        studyField: "Business & Management",
        requirements: "High School Certificate, IELTS 6.0, Personal Statement",
        hasScholarship: "TRUE",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      }
    ];

    // Create worksheets
    const universitiesWS = XLSX.utils.json_to_sheet(universitiesTemplate);
    const programsWS = XLSX.utils.json_to_sheet(programsTemplate);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, universitiesWS, "Universities");
    XLSX.utils.book_append_sheet(workbook, programsWS, "Programs");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=university-programs-template.xlsx");

    res.send(buffer);
  } catch (error) {
    console.error("Error generating Excel template:", error);
    res.status(500).json({ error: "Failed to generate Excel template" });
  }
});

export default router;