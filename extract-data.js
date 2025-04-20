import fetch from 'node-fetch';
import { load } from 'cheerio';
import fs from 'fs/promises';

// The URLs to scrape
const BASE_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev';
const UNIVERSITIES_URL = `${BASE_URL}/`;
const PROGRAMS_URL = `${BASE_URL}/`;

// Function to extract university data
async function extractUniversities() {
  console.log('Fetching and analyzing university data...');
  
  try {
    const response = await fetch(UNIVERSITIES_URL);
    const html = await response.text();
    
    // Save raw HTML for analysis
    await fs.writeFile('raw-university-page.html', html);
    
    const $ = load(html);
    
    // Try to identify patterns in the HTML that contain university information
    const universities = [];
    
    // Look for any structure that might contain university information
    $('div, section, li, tr').each((i, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      // Skip if element is too small to contain university info
      if (text.length < 30) return;
      
      // Check if text contains the word "university"
      if (text.toLowerCase().includes('university') || text.toLowerCase().includes('college')) {
        // Try to extract university name
        let name = '';
        let location = 'UAE';
        
        // Check for headings that might contain university names
        const heading = $element.find('h1, h2, h3, h4, h5, h6').first();
        if (heading.length > 0) {
          name = heading.text().trim();
        } else {
          // Try to extract from element text
          const match = text.match(/(?:University|College|Institute)[^.]*?(?:\.|$)/i);
          if (match) {
            name = match[0].trim();
          }
        }
        
        // Clean up the name
        if (name) {
          name = name.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
          
          // Add to list if not a duplicate and not too short
          if (name.length > 5 && !universities.some(u => u.name === name)) {
            universities.push({
              name,
              location,
              url: $element.find('a').attr('href')
            });
          }
        }
      }
    });
    
    console.log(`Found ${universities.length} potential universities`);
    
    // Save extracted university data
    await fs.writeFile('extracted-universities.json', JSON.stringify(universities, null, 2));
    
    return universities;
  } catch (error) {
    console.error('Error extracting universities:', error);
    return [];
  }
}

// Function to extract program data
async function extractPrograms() {
  console.log('Fetching and analyzing program data...');
  
  try {
    const response = await fetch(PROGRAMS_URL);
    const html = await response.text();
    
    // Save raw HTML for analysis
    await fs.writeFile('raw-program-page.html', html);
    
    const $ = load(html);
    
    // Try to identify patterns in the HTML that contain program information
    const programs = [];
    
    // Look for any structure that might contain program information
    $('div, section, li, tr').each((i, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      // Skip if element is too small to contain program info
      if (text.length < 30) return;
      
      // Check if text contains degree keywords
      if (text.toLowerCase().includes('bachelor') || 
          text.toLowerCase().includes('master') || 
          text.toLowerCase().includes('phd') || 
          text.toLowerCase().includes('degree')) {
        
        // Try to extract program name
        let name = '';
        let universityName = '';
        
        // Check for headings that might contain program names
        const heading = $element.find('h1, h2, h3, h4, h5, h6').first();
        if (heading.length > 0) {
          name = heading.text().trim();
        } else {
          // Try to extract from element text using common degree patterns
          const degreeMatch = text.match(/(?:Bachelor|Master|PhD|Doctorate|Diploma)[^.]*?(?:\.|$)/i);
          if (degreeMatch) {
            name = degreeMatch[0].trim();
          }
        }
        
        // Try to extract university name
        const universityMatch = text.match(/(?:University|College|Institute)[^.]*?(?:\.|$)/i);
        if (universityMatch) {
          universityName = universityMatch[0].trim();
        }
        
        // Clean up the names
        if (name) {
          name = name.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
          
          // Extract degree and field of study
          let degree = 'Bachelor\'s Degree';
          if (name.toLowerCase().includes('master')) degree = 'Master\'s Degree';
          if (name.toLowerCase().includes('phd') || name.toLowerCase().includes('doctor')) degree = 'PhD';
          if (name.toLowerCase().includes('diploma')) degree = 'Diploma';
          
          let studyField = '';
          if (name.toLowerCase().includes('business') || name.toLowerCase().includes('management') || 
              name.toLowerCase().includes('finance') || name.toLowerCase().includes('marketing')) {
            studyField = 'Business & Management';
          } else if (name.toLowerCase().includes('computer') || name.toLowerCase().includes('it') || 
                    name.toLowerCase().includes('information')) {
            studyField = 'Computer Science & IT';
          } else if (name.toLowerCase().includes('engineer')) {
            studyField = 'Engineering';
          } else if (name.toLowerCase().includes('medicine') || name.toLowerCase().includes('health') || 
                    name.toLowerCase().includes('nursing')) {
            studyField = 'Medicine & Health';
          } else {
            studyField = 'Arts & Humanities';
          }
          
          // Extract tuition, duration, and intake information if available
          const tuition = text.match(/(?:tuition|fee)[^\d]*?(\d[\d,\.]+ ?(?:AED|USD|EUR))/i);
          const duration = text.match(/(\d+(?:\.\d+)? years?)/i);
          const intake = text.match(/(?:intake|start)[^:]*?[:\s]([\w\/]+)/i);
          
          // Add to list if not a duplicate and not too short
          if (name.length > 5 && !programs.some(p => p.name === name)) {
            programs.push({
              name,
              universityName,
              degree,
              studyField,
              tuition: tuition ? tuition[1] : '35,000 AED/year',
              duration: duration ? duration[1] : '4 years',
              intake: intake ? intake[1] : 'September',
              requirements: ['High School Certificate', 'IELTS 6.0'],
              hasScholarship: text.toLowerCase().includes('scholarship')
            });
          }
        }
      }
    });
    
    console.log(`Found ${programs.length} potential programs`);
    
    // Save extracted program data
    await fs.writeFile('extracted-programs.json', JSON.stringify(programs, null, 2));
    
    return programs;
  } catch (error) {
    console.error('Error extracting programs:', error);
    return [];
  }
}

// Main function
async function main() {
  console.log('Starting data extraction...');
  
  // Extract universities
  const universities = await extractUniversities();
  
  // Extract programs
  const programs = await extractPrograms();
  
  console.log(`Extraction completed: ${universities.length} universities and ${programs.length} programs found`);
  
  // Check if we need to scrape individual university pages to get more data
  if (universities.length < 31 || programs.length < 913) {
    console.log('Did not find all universities and programs. Checking the page source for additional links...');
    
    try {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      const $ = load(html);
      
      // Look for a data source script or link
      const dataScript = $('script').filter(function() {
        return $(this).text().includes('universities') || $(this).text().includes('programs');
      });
      
      if (dataScript.length > 0) {
        console.log('Found potential data script in page source. Saving for analysis...');
        await fs.writeFile('data-script.js', dataScript.text());
      }
      
      // Check for embedded JSON data
      const jsonMatches = html.match(/\{[\s\S]*?"universities"[\s\S]*?\}/);
      if (jsonMatches) {
        console.log('Found potential JSON data in page source. Saving for analysis...');
        await fs.writeFile('embedded-data.json', jsonMatches[0]);
      }
      
    } catch (error) {
      console.error('Error checking for additional data sources:', error);
    }
  }
  
  console.log('Data extraction process completed.');
}

main();