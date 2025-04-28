/**
 * Extremely lightweight dev server that starts quickly
 * to help with Replit workflow
 */
import express from 'express';

// Create a very simple Express app
const app = express();
const port = 5000;

// Health check API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Lightweight server is running',
    timestamp: new Date().toISOString()
  });
});

// Basic static message
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Guide Platform - Light Mode</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #4a6cf7; }
          .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>Guide Platform - Lightweight Server</h1>
        <div class="card">
          <p>This is a lightweight version of the server for diagnostic purposes.</p>
          <p>Server started at: ${new Date().toLocaleString()}</p>
          <p>Use the health check API at: <a href="/api/health">/api/health</a></p>
        </div>
      </body>
    </html>
  `);
});

// Start server - this should be extremely fast
app.listen(port, '0.0.0.0', () => {
  console.log(`Lightweight server running on port ${port}`);
});