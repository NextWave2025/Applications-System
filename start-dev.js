#!/usr/bin/env node

/**
 * Simple development server startup script
 * This bypasses the workflow configuration issues
 */

import { spawn } from 'child_process';
import path from 'path';

console.log('Starting development server...');

// Start the development server
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

devProcess.on('error', (error) => {
  console.error('Failed to start development server:', error);
  process.exit(1);
});

devProcess.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down development server...');
  devProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down development server...');
  devProcess.kill('SIGTERM');
});