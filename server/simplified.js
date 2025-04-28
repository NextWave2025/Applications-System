/**
 * Simplified server script for testing environment
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const port = 5000;

// Enable JSON parsing
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Simple test route
app.get('/test', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'static-test.html'));
});

// Health check API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

// Start server quickly without any intensive operations
app.listen(port, '0.0.0.0', () => {
  console.log(`Simplified server running on port ${port}`);
  console.log(`Test page available at: http://localhost:${port}/test`);
  console.log(`Health check API: http://localhost:${port}/api/health`);
});