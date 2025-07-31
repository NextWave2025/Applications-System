import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scrapeData } from "./scraper";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import adminRouter from "./routes/admin";
import subAdminRouter from "./routes/sub-admin";
import { sendApplicationStatusNotification } from "./email-service";
import { setupEmailTestRoutes } from "./routes/email-test";

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  // 🚨 CRITICAL FIX: Health check endpoint for production debugging
  app.get("/api/health", (req, res) => {
    const hostname = req.hostname || req.get('host') || 'unknown';
    const host = req.get('host') || 'unknown';
    
    // More robust production detection
    const isProduction = hostname.includes('replit.dev') || hostname.includes('replit.app') || 
                        hostname.includes('vercel.app') || hostname.includes('netlify.app') ||
                        hostname.includes('herokuapp.com') || hostname.includes('railway.app') ||
                        host.includes('replit.dev') || host.includes('replit.app') ||
                        (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && 
                         !host.includes('localhost') && !host.includes('127.0.0.1'));
    
    res.json({
      status: "OK",
      environment: isProduction ? "production" : "development",
      timestamp: new Date().toISOString(),
      hostname: hostname,
      host: host,
      origin: req.get('origin') || 'unknown',
      protocol: req.protocol,
      url: req.url,
      isProduction: isProduction,
      nodeEnv: process.env.NODE_ENV || 'not_set'
    });
  });

  // Mount admin routes
  app.use('/api/admin', adminRouter);
  
  // Mount sub-admin routes
  app.use('/api/sub-admin', subAdminRouter);
  
  // Setup email testing routes
  setupEmailTestRoutes(app);

  // Configure multer for file uploads
  const multerStorage = multer.memoryStorage(); // Use memory storage for simplicity
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB file size limit
    }
  });

  // API endpoint to get universities
  app.get("/api/universities", async (req, res) => {
    try {
      // Add CORS headers explicitly for debugging
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      const universities = await storage.getUniversities();
      console.log(`Found ${universities.length} universities`);
      res.json(universities);
    } catch (error) {
      console.error("Error fetching universities:", error);
      res.status(500).json({ error: "Failed to fetch universities" });
    }
  });

  // API endpoint to get a specific university
  app.get("/api/universities/:id", async (req, res) => {
    try {
      const university = await storage.getUniversityById(parseInt(req.params.id));
      if (!university) {
        return res.status(404).json({ error: "University not found" });
      }
      res.json(university);
    } catch (error) {
      console.error("Error fetching university:", error);
      res.status(500).json({ error: "Failed to fetch university" });
    }
  });

  // API endpoint to get programs with filters
  app.get("/api/programs", async (req, res) => {
    try {
      console.log("GET /api/programs request with query:", req.query);
      
      // Add CORS headers explicitly for debugging
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');

      const { 
        university, 
        universityId,
        degree, 
        studyField, 
        hasScholarship, 
        maxTuition, 
        minTuition,
        duration, 
        search,
        location,
        intake
      } = req.query;

      const filters: any = {};

      if (university) {
        try {
          filters.universityIds = Array.isArray(university) 
            ? university.map(id => parseInt(id as string))
            : [parseInt(university as string)];
        } catch (e) {
          console.error("Error parsing university filter:", e);
        }
      }

      // Support direct universityId parameter for university detail pages
      if (universityId) {
        try {
          filters.universityIds = Array.isArray(universityId) 
            ? universityId.map(id => parseInt(id as string))
            : [parseInt(universityId as string)];
        } catch (e) {
          console.error("Error parsing universityId filter:", e);
        }
      }

      if (degree) {
        filters.studyLevel = Array.isArray(degree) 
          ? degree.map(d => d as string)
          : [degree as string];
      }

      if (studyField) {
        filters.studyField = Array.isArray(studyField) 
          ? studyField.map(f => f as string)
          : [studyField as string];
      }

      if (location) {
        filters.location = Array.isArray(location)
          ? location.map(l => l as string)
          : [location as string];
      }

      if (intake) {
        filters.intake = Array.isArray(intake)
          ? intake.map(i => i as string)
          : [intake as string];
      }

      if (hasScholarship === 'true') {
        filters.hasScholarship = true;
      }

      if (minTuition) {
        try {
          filters.minTuition = parseInt(minTuition as string);
        } catch (e) {
          console.error("Error parsing minTuition filter:", e);
        }
      }

      if (maxTuition) {
        try {
          filters.maxTuition = parseInt(maxTuition as string);
        } catch (e) {
          console.error("Error parsing maxTuition filter:", e);
        }
      }

      if (duration) {
        filters.duration = Array.isArray(duration)
          ? duration.map(d => d as string)
          : [duration as string];
      }

      if (search) {
        filters.search = search as string;
      }

      console.log("Applying filters:", filters);

      try {
        const programs = await storage.getPrograms(filters);
        console.log(`Found ${programs.length} programs matching filters`);
        res.json(programs);
      } catch (dbError: any) {
        console.error("Database error fetching programs:", dbError);
        res.status(500).json({ error: "Database error: " + (dbError?.message || dbError) });
      }
    } catch (error: any) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ error: "Failed to fetch programs: " + (error?.message || String(error)) });
    }
  });

  // API endpoint to get a specific program with university details
  app.get("/api/programs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid program ID" });
      }

      const programWithUniversity = await storage.getProgramById(id);
      if (!programWithUniversity) {
        return res.status(404).json({ error: "Program not found" });
      }

      res.json(programWithUniversity);
    } catch (error) {
      console.error("Error fetching program:", error);
      res.status(500).json({ error: "Failed to fetch program" });
    }
  });

  // API endpoint to search programs by name
  app.get("/api/search/programs/:query", async (req, res) => {
    try {
      const query = req.params.query.toLowerCase();
      const programs = await storage.getPrograms({
        search: query
      });

      res.json(programs);
    } catch (error) {
      console.error("Error searching programs:", error);
      res.status(500).json({ error: "Failed to search programs" });
    }
  });

  // API endpoint to initialize data (for testing purposes)
  app.post("/api/init-data", async (req, res) => {
    try {
      if (req.isAuthenticated() && req.user.role === 'admin') {
        await scrapeData();
        res.json({ success: true, message: "Data initialization completed" });
      } else {
        res.status(403).json({ error: "Unauthorized" });
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ error: "Failed to initialize data" });
    }
  });

  // Application endpoints (requires authentication)
  // Get all applications for the authenticated user
  app.get("/api/applications", async (req, res) => {
    try {
      console.log("GET /api/applications request received");
      console.log("Authentication status:", req.isAuthenticated());
      console.log("User in session:", req.user);

      if (!req.isAuthenticated()) {
        console.log("User not authenticated, returning 401");
        return res.status(401).json({ error: "Authentication required" });
      }

      console.log("Fetching applications for user ID:", req.user.id);
      const applications = await storage.getApplications(req.user.id);
      console.log(`Found ${applications.length} applications for user ID ${req.user.id}`);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Get a specific application
  app.get("/api/applications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid application ID" });
      }

      const application = await storage.getApplicationById(id);

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Check if the application belongs to the authenticated user
      if (application.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access to this application" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  // Create a new application
  app.post("/api/applications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Add the authenticated user's ID to the application data
      const applicationData = {
        ...req.body,
        userId: req.user.id,
        status: "draft" // Default status
      };

      // Convert Date objects to string format for database
      if (applicationData.studentDateOfBirth instanceof Date) {
        applicationData.studentDateOfBirth = applicationData.studentDateOfBirth.toISOString().split('T')[0];
      } else if (typeof applicationData.studentDateOfBirth === 'string') {
        // Ensure date string is in YYYY-MM-DD format
        const date = new Date(applicationData.studentDateOfBirth);
        applicationData.studentDateOfBirth = date.toISOString().split('T')[0];
      }

      const application = await storage.createApplication(applicationData);

      // Send notification to admins about new application submission
      if (applicationData.status === "submitted") {
        try {
          const { notificationService } = await import('./services/notification-service');
          const program = await storage.getProgramById(application.programId);
          const university = program ? await storage.getUniversityById(program.universityId) : null;
          
          await notificationService.sendApplicationSubmittedNotification({
            applicantName: `${application.studentFirstName} ${application.studentLastName}`.trim(),
            applicantEmail: req.user.username,
            programName: program?.name || 'Unknown Program',
            universityName: university?.name || 'Unknown University',
            status: application.status,
            submissionDate: new Date().toLocaleDateString()
          });
          console.log(`Admin notification sent for new application: ${application.id}`);
        } catch (notificationError) {
          console.error('Failed to send admin notification:', notificationError);
          // Don't fail application creation if notification fails
        }
      }

      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ error: "Failed to create application" });
    }
  });

  // Archive application
  app.patch("/api/applications/:id/archive", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid application ID" });
      }

      const application = await storage.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access to this application" });
      }

      const updatedApplication = await storage.updateApplicationStatus(id, "archived", req.user.id);
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error archiving application:", error);
      res.status(500).json({ error: "Failed to archive application" });
    }
  });

  // Delete application
  app.delete("/api/applications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid application ID" });
      }

      const application = await storage.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access to this application" });
      }

      await storage.deleteApplication(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ error: "Failed to delete application" });
    }
  });

  // Update application status
  app.patch("/api/applications/:id/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid application ID" });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      // Check if the application belongs to the authenticated user
      const application = await storage.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access to this application" });
      }

      const previousStatus = application.status;
      const updatedApplication = await storage.updateApplicationStatus(id, status, req.user.id);

      // Send notification to admins about status change
      if (previousStatus !== status) {
        try {
          const { notificationService } = await import('./services/notification-service');
          const program = await storage.getProgramById(application.programId);
          const university = program ? await storage.getUniversityById(program.universityId) : null;
          
          await notificationService.sendApplicationStatusChangedNotification({
            applicantName: `${application.studentFirstName} ${application.studentLastName}`.trim(),
            applicantEmail: req.user.username,
            programName: program?.name || 'Unknown Program',
            universityName: university?.name || 'Unknown University',
            status: status,
            previousStatus: previousStatus,
            submissionDate: new Date(application.createdAt).toLocaleDateString()
          });
          console.log(`Admin notification sent for status change: ${application.id} (${previousStatus} → ${status})`);
        } catch (notificationError) {
          console.error('Failed to send admin notification:', notificationError);
          // Don't fail status update if notification fails
        }
      }

      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ error: "Failed to update application status" });
    }
  });

  // Update full application
  app.put("/api/applications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid application ID" });
      }

      // Check if the application belongs to the authenticated user
      const application = await storage.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access to this application" });
      }

      // Update the application
      const updatedData = {
        ...req.body,
        updatedAt: new Date(),
      };

      // Ensure we don't modify userId or programId
      delete updatedData.id;
      delete updatedData.userId;
      delete updatedData.programId;
      delete updatedData.createdAt;

      // If studentDateOfBirth is provided as string, we need to handle it specially for Postgres
      if (updatedData.studentDateOfBirth) {
        // For string input, convert to formatted date string YYYY-MM-DD
        if (typeof updatedData.studentDateOfBirth === 'string') {
          // Date is already in string format, make sure it's properly formatted
          const dateObj = new Date(updatedData.studentDateOfBirth);
          updatedData.studentDateOfBirth = dateObj.toISOString().split('T')[0];
        } 
        // For Date object input, convert to formatted date string
        else if (updatedData.studentDateOfBirth instanceof Date) {
          updatedData.studentDateOfBirth = updatedData.studentDateOfBirth.toISOString().split('T')[0];
        }
      }

      const updatedApplication = await storage.updateApplication(id, updatedData);
      res.json(updatedApplication);
    } catch (error: any) {
      console.error("Error updating application:", error);
      res.status(500).json({ error: "Failed to update application: " + (error?.message || String(error)) });
    }
  });

  // Document endpoints (requires authentication)
  // Get all documents for an application
  app.get("/api/applications/:id/documents", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const applicationId = parseInt(req.params.id);
      if (isNaN(applicationId)) {
        return res.status(400).json({ error: "Invalid application ID" });
      }

      // Check if the application belongs to the authenticated user
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access to this application's documents" });
      }

      const documents = await storage.getDocumentsByApplicationId(applicationId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Upload a document to an application
  app.post("/api/applications/:id/documents", upload.single('file'), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      console.log("Document upload request for application, body:", req.body);
      console.log("Uploaded file:", req.file);

      const applicationId = parseInt(req.params.id);
      if (isNaN(applicationId)) {
        return res.status(400).json({ error: "Invalid application ID" });
      }

      // Check if the application belongs to the authenticated user
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (application.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access to this application" });
      }

      // Get document type and other metadata from the form data
      const { type, documentType, name, description } = req.body;

      // Use either type or documentType (handle both field name patterns)
      const finalDocumentType = type || documentType || 'other';

      // Create document record with application ID and file data
      const documentData = {
        applicationId,
        documentType: finalDocumentType,
        filename: req.file ? req.file.originalname.replace(/\s+/g, '_') : 'file.txt',
        originalFilename: req.file ? req.file.originalname : 'Untitled Document',
        fileSize: req.file ? req.file.size : 0,
        mimeType: req.file ? req.file.mimetype : 'text/plain',
        fileData: req.file ? req.file.buffer.toString('base64') : null
      };

      console.log("Creating document for application with data:", {
        ...documentData,
        fileData: documentData.fileData ? `[Base64 encoded data - ${documentData.fileSize} bytes]` : null
      });

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  // Upload a document directly (without application ID in path)
  // DELETE a document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }

      // Get the document to verify ownership
      const document = await storage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Get the application to verify ownership
      const application = await storage.getApplicationById(document.applicationId);
      if (!application) {
        return res.status(404).json({ error: "Associated application not found" });
      }

      // Check if the application belongs to the authenticated user
      if (application.userId !== req.user.id) {
        return res.status(403).json({ error: "You don't have permission to delete this document" });
      }

      // Delete the document
      await storage.deleteDocument(documentId);

      res.status(200).json({ success: true, message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  app.post("/api/documents", upload.single('file'), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      console.log("Document upload request body:", req.body);
      console.log("Uploaded file:", req.file);

      // When using FormData, req.body.applicationId might be a string
      const applicationIdRaw = req.body.applicationId;
      console.log("Application ID (raw):", applicationIdRaw);

      const applicationId = parseInt(applicationIdRaw);
      console.log("Application ID (parsed):", applicationId);

      if (isNaN(applicationId)) {
        return res.status(400).json({ 
          error: "Invalid application ID in request body",
          received: applicationIdRaw,
          parsed: applicationId
        });
      }

      // Check if the application belongs to the authenticated user
      const application = await storage.getApplicationById(applicationId);
      console.log("Found application:", application ? "Yes" : "No");

      if (!application) {
        return res.status(404).json({ error: "Application not found", applicationId });
      }

      if (application.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized access to this application" });
      }

      // Get document type and other metadata from the form data
      const { type, documentType, name, description } = req.body;

      // Use either type or documentType (handle both field name patterns)
      const finalDocumentType = type || documentType || 'other';

      // Create document record with application ID and file data
      const documentData = {
        applicationId,
        documentType: finalDocumentType,
        filename: req.file ? req.file.originalname.replace(/\s+/g, '_') : 'file.txt',
        originalFilename: req.file ? req.file.originalname : 'Untitled Document',
        fileSize: req.file ? req.file.size : 0,
        mimeType: req.file ? req.file.mimetype : 'text/plain',
        fileData: req.file ? req.file.buffer.toString('base64') : null
      };

      console.log("Creating document with data:", {
        ...documentData,
        fileData: documentData.fileData ? `[Base64 encoded data - ${documentData.fileSize} bytes]` : null
      });

      const document = await storage.createDocument(documentData);
      console.log("Document created:", {
        ...document,
        fileData: document.fileData ? `[Base64 encoded data - ${document.fileSize} bytes]` : null
      });

      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
  
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      const applicationId = parseInt(req.query.applicationId as string);
      if (isNaN(applicationId)) {
        return res.status(400).json({ error: "Invalid application ID" });
      }
  
      // Check if the user is authorized to access these documents
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
  
      // Only the application owner and admins can access the documents
      const isOwner = application.userId === userId;
      const isAdmin = req.user?.role === "admin";
  
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      const documents = await storage.getDocumentsByApplicationId(applicationId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Document download route for admin and application owners
  app.get("/api/documents/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }

      const document = await storage.getDocumentById(documentId);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Check if user has permission to download this document
      const application = await storage.getApplicationById(document.applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      const isOwner = application?.userId === req.user?.id;
      const isAdmin = req.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Serve the actual file data
      if (!document.fileData) {
        return res.status(404).json({ error: "File data not found" });
      }

      try {
        // Convert base64 back to binary buffer
        const fileBuffer = Buffer.from(document.fileData, 'base64');
        
        // Set proper headers for file download
        res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalFilename}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        
        // Send the file buffer
        res.send(fileBuffer);
      } catch (bufferError) {
        console.error("Error converting file data:", bufferError);
        return res.status(500).json({ error: "File data corrupted" });
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ error: "Failed to download document" });
    }
  });

  // File upload route (if you have one)
  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { applicationId, documentType } = req.body;

      if (!applicationId || !documentType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify the user owns this application or is admin
      const application = await storage.getApplicationById(parseInt(applicationId));
      const isOwner = application?.userId === req.user?.id;
      const isAdmin = req.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      const documentData = {
        applicationId: parseInt(applicationId),
        documentType,
        filename: req.file.originalname.replace(/\s+/g, '_'), // Sanitize filename
        originalFilename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileData: req.file.buffer.toString('base64') // Store file data as base64
      };
      const document = await storage.createDocument(documentData);

      // Log the upload action
      await storage.createAuditLog({
        userId: req.user?.id || 0,
        action: isAdmin ? "admin_upload_document" : "upload_document",
        resourceType: "document",
        resourceId: document.id,
        newData: {
          applicationId: parseInt(applicationId),
          documentType,
          originalFilename: req.file.originalname,
          fileSize: req.file.size
        }
      });

      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });



  // API endpoint for consultation requests
  app.post("/api/consultation-request", async (req, res) => {
    try {
      const { name, email, phone, studyField, currentEducation, preferredIntake, message, source } = req.body;
      
      // Send email notification about consultation request
      try {
        const { sendConsultationRequestEmail } = await import('./email-service.js');
        await sendConsultationRequestEmail({
          name,
          email,
          phone,
          studyField,
          currentEducation,
          preferredIntake,
          message,
          source
        });
      } catch (emailError) {
        console.error("Failed to send consultation request email:", emailError);
        // Continue even if email fails
      }
      
      res.json({ success: true, message: "Consultation request submitted successfully" });
    } catch (error) {
      console.error("Error handling consultation request:", error);
      res.status(500).json({ error: "Failed to submit consultation request" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}