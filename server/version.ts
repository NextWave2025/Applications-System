// Version file for cache busting and debugging
export const VERSION = {
  build: Date.now(),
  timestamp: new Date().toISOString(),
  commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  environment: process.env.NODE_ENV || 'development'
};

console.log('🚀 Server version:', VERSION); 