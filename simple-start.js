import { exec } from 'child_process';

console.log('Starting application directly...');

// Kill any existing processes on port 5000
exec('pkill -f "tsx server/index.ts"', () => {
  // Start the development server
  const process = exec('npm run dev', {
    cwd: '/home/runner/workspace',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  process.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  process.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  process.on('exit', (code) => {
    console.log(`Process exited with code ${code}`);
  });
});