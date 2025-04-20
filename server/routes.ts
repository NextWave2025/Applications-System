import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scrapeData } from "./scraper";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // API endpoint to get universities
  app.get("/api/universities", async (req, res) => {
    try {
      const universities = await storage.getUniversities();
      res.json(universities);
    } catch (error) {
      console.error("Error fetching universities:", error);
      res.status(500).json({ error: "Failed to fetch universities" });
    }
  });

  // API endpoint to get a specific university
  app.get("/api/universities/:id", async (req, res) => {
    try {
      const university = await storage.getUniversity(parseInt(req.params.id));
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
      const { university, degree, studyField, hasScholarship } = req.query;
      
      const filters: any = {};
      
      if (university) {
        filters.universityId = parseInt(university as string);
      }
      
      if (degree) {
        filters.degree = degree as string;
      }
      
      if (studyField) {
        filters.studyField = studyField as string;
      }
      
      if (hasScholarship === 'true') {
        filters.hasScholarship = true;
      }
      
      const programs = await storage.getPrograms(filters);
      
      // Get university details for each program
      const programsWithUniversity = await Promise.all(
        programs.map(async (program) => {
          const university = await storage.getUniversity(program.universityId);
          return {
            ...program,
            university: university ? {
              name: university.name,
              location: university.location,
              imageUrl: university.imageUrl
            } : null
          };
        })
      );
      
      res.json(programsWithUniversity);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });

  // API endpoint to get a specific program with university details
  app.get("/api/programs/:id", async (req, res) => {
    try {
      const program = await storage.getProgram(parseInt(req.params.id));
      if (!program) {
        return res.status(404).json({ error: "Program not found" });
      }
      
      const university = await storage.getUniversity(program.universityId);
      
      const programWithUniversity = {
        ...program,
        university: university ? {
          name: university.name,
          location: university.location,
          imageUrl: university.imageUrl
        } : null
      };
      
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
      const programs = await storage.getPrograms();
      
      const filteredPrograms = programs.filter(program => 
        program.name.toLowerCase().includes(query) ||
        program.studyField.toLowerCase().includes(query) ||
        program.degree.toLowerCase().includes(query)
      );
      
      // Get university details for each program
      const programsWithUniversity = await Promise.all(
        filteredPrograms.map(async (program) => {
          const university = await storage.getUniversity(program.universityId);
          return {
            ...program,
            university: university ? {
              name: university.name,
              location: university.location,
              imageUrl: university.imageUrl
            } : null
          };
        })
      );
      
      res.json(programsWithUniversity);
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

  const httpServer = createServer(app);

  return httpServer;
}