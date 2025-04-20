/**
 * Data initialization script
 * Run this script to initialize the database with universities and programs
 * from the provided data source.
 */

import fetch from 'node-fetch';

// The base URL where the API is running
const API_URL = 'http://localhost:5000';

async function initializeData() {
  try {
    console.log('Starting data initialization...');
    
    // Call the initialize endpoint
    const response = await fetch(`${API_URL}/api/initialize`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to initialize data: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Data initialization successful:', data);
    
    // Check the universities
    const universitiesResponse = await fetch(`${API_URL}/api/universities`);
    const universities = await universitiesResponse.json();
    console.log(`Fetched ${universities.length} universities`);
    
    // Check the programs
    const programsResponse = await fetch(`${API_URL}/api/programs`);
    const programs = await programsResponse.json();
    console.log(`Fetched ${programs.length} programs`);
    
    console.log('Data initialization completed successfully');
  } catch (error) {
    console.error('Error during data initialization:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeData();