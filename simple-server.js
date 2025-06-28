/**
 * Simple server for testing without Vite to isolate the crash issue
 */
import express from "express";
import path from "path";
import { storage } from "./server/storage.js";

const app = express();
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ status: 'Server is working', timestamp: new Date().toISOString() });
});

// Universities API route
app.get('/api/universities', async (req, res) => {
  try {
    const universities = await storage.getUniversities();
    res.json(universities);
  } catch (error) {
    console.error("Error fetching universities:", error);
    res.status(500).json({ error: "Failed to fetch universities" });
  }
});

const port = 5001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Simple test server running on port ${port}`);
});