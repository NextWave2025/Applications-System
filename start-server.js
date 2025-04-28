/**
 * Helper script to start the server with better error handling
 */
import { spawn } from 'child_process';

console.log('Starting server in development mode...');

// Start the server process with environment variables
const env = {
  ...process.env,
  NODE_ENV: 'development',
};

// Run the server
const serverProcess = spawn('tsx', ['server/index.ts'], {
  env,
  stdio: 'inherit', // This pipes the child's stdout and stderr to the parent
});

// Log PID for debugging
console.log(`Server process started with PID: ${serverProcess.pid}`);

// Handle server exit
serverProcess.on('exit', (code, signal) => {
  if (code) {
    console.error(`Server process exited with code ${code}`);
  } else if (signal) {
    console.error(`Server process was killed with signal ${signal}`);
  } else {
    console.log('Server process exited normally');
  }
});

// Handle server error
serverProcess.on('error', (err) => {
  console.error(`Failed to start server process: ${err}`);
});

// Keep the script running
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down server gracefully...');
  serverProcess.kill('SIGINT');
  // Allow some time for cleanup before exiting
  setTimeout(() => process.exit(0), 1000);
});