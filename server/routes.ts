import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, type ProgramFilters } from "./storage";
import { z } from "zod";
import { scrapeData } from "./scraper";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  // Initialize data from scraper
  app.get("/api/initialize", async (req: Request, res: Response) => {
    try {
      await storage.clearAll();
      await scrapeData();
      res.json({ success: true, message: "Data initialized successfully" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to initialize data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get all programs with optional filters
  app.get("/api/programs", async (req: Request, res: Response) => {
    try {
      const filters: ProgramFilters = {};
      
      // Parse study levels
      if (req.query.studyLevel) {
        filters.studyLevel = Array.isArray(req.query.studyLevel) 
          ? req.query.studyLevel as string[] 
          : [req.query.studyLevel as string];
      }
      
      // Parse study fields
      if (req.query.studyField) {
        filters.studyField = Array.isArray(req.query.studyField) 
          ? req.query.studyField as string[] 
          : [req.query.studyField as string];
      }
      
      // Parse university IDs
      if (req.query.universityIds) {
        const universityIdStrings = Array.isArray(req.query.universityIds) 
          ? req.query.universityIds as string[] 
          : [req.query.universityIds as string];
        
        filters.universityIds = universityIdStrings.map(id => parseInt(id)).filter(id => !isNaN(id));
      }
      
      // Parse max tuition
      if (req.query.maxTuition && typeof req.query.maxTuition === 'string') {
        const maxTuition = parseInt(req.query.maxTuition);
        if (!isNaN(maxTuition)) {
          filters.maxTuition = maxTuition;
        }
      }
      
      // Parse duration
      if (req.query.duration) {
        filters.duration = Array.isArray(req.query.duration) 
          ? req.query.duration as string[] 
          : [req.query.duration as string];
      }
      
      // Parse scholarship filter
      if (req.query.hasScholarship !== undefined) {
        filters.hasScholarship = req.query.hasScholarship === 'true';
      }
      
      // Parse search query
      if (req.query.search && typeof req.query.search === 'string') {
        filters.search = req.query.search;
      }
      
      const programs = await storage.getPrograms(filters);
      res.json(programs);
    } catch (error) {
      console.error("Error getting programs:", error);
      res.status(500).json({ 
        message: "Failed to get programs",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get a single program by ID
  app.get("/api/programs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid program ID" });
      }
      
      const program = await storage.getProgramById(id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(program);
    } catch (error) {
      console.error("Error getting program:", error);
      res.status(500).json({ 
        message: "Failed to get program",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get all universities
  app.get("/api/universities", async (req: Request, res: Response) => {
    try {
      const universities = await storage.getUniversities();
      res.json(universities);
    } catch (error) {
      console.error("Error getting universities:", error);
      res.status(500).json({ 
        message: "Failed to get universities",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get a single university by ID
  app.get("/api/universities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid university ID" });
      }
      
      const university = await storage.getUniversityById(id);
      if (!university) {
        return res.status(404).json({ message: "University not found" });
      }
      
      res.json(university);
    } catch (error) {
      console.error("Error getting university:", error);
      res.status(500).json({ 
        message: "Failed to get university",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
