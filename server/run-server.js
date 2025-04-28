/**
 * Simple server start script with basic debugging
 */
import { exec } from 'child_process';

console.log('Starting server in development mode...');

// Start the server process
const serverProcess = exec('NODE_ENV=development tsx server/index.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
  console.log(`${data.trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`${data.trim()}`);
});

// Keep the script running
console.log('Server script running - press Ctrl+C to stop');