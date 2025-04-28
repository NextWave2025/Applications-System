// Script to run the server with enhanced diagnostics
import { spawn } from 'child_process';
import fs from 'fs';

const LOG_FILE = './server-diagnostics.log';

// Clear previous log file
try {
  fs.writeFileSync(LOG_FILE, '--- Server Diagnostics Log ---\n', { flag: 'w' });
} catch (err) {
  console.error('Error clearing log file:', err);
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
}

log('Starting server with diagnostics...');

// Check environment
log(`Node version: ${process.version}`);
log(`Current directory: ${process.cwd()}`);
log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);

// Start the server process
const serverProcess = spawn('tsx', ['server/index.ts'], {
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'pipe'
});

log(`Server process started with PID: ${serverProcess.pid}`);

// Handle stdout
serverProcess.stdout.on('data', (data) => {
  const output = data.toString().trim();
  log(`[SERVER OUT] ${output}`);
});

// Handle stderr
serverProcess.stderr.on('data', (data) => {
  const output = data.toString().trim();
  log(`[SERVER ERR] ${output}`);
});

// Handle process exit
serverProcess.on('exit', (code, signal) => {
  log(`Server process exited with code ${code} and signal ${signal}`);
  if (code !== 0) {
    log('Server crashed or exited with error');
  }
});

// Handle process error
serverProcess.on('error', (err) => {
  log(`Failed to start server process: ${err.message}`);
});

// Keep the process running
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down...');
  serverProcess.kill();
  process.exit(0);
});

log('Diagnostic wrapper running, waiting for server events...');