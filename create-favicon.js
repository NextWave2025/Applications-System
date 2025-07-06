const fs = require('fs');

// Create a simple base64 encoded favicon data for NextWave
// This creates a 32x32 blue favicon with a white graduation cap

const faviconData = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#3B82F6" rx="4"/>
  <g transform="translate(8, 10)">
    <path d="M8 0L16 2L8 4L0 2L8 0Z" fill="#FFFFFF"/>
    <path d="M6 2V6C6 7.1 6.9 8 8 8C9.1 8 10 7.1 10 6V2" fill="#FFFFFF"/>
    <circle cx="14" cy="2" r="1" fill="#FEF3C7"/>
  </g>
  <path d="M4 20C6 18 8 18 10 20C12 22 14 22 16 20C18 18 20 18 22 20C24 22 26 22 28 20" 
        stroke="#FFFFFF" stroke-width="1" fill="none" opacity="0.7"/>
</svg>
`).toString('base64')}`;

console.log('NextWave Favicon created successfully');
console.log('Favicon data:', faviconData);