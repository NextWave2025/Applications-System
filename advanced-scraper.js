const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Scrapes university and program data from the provided URL with enhanced detail retrieval
 */
async function scrapeEducationalData() {
  console.log('Starting advanced data scraping process...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: true
  });
  
  try {
    console.log('Browser launched, navigating to page...');
    const page = await browser.newPage();
    
    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the main page
    await page.goto('https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    console.log('Page loaded. Extracting universities...');
    
    // Extract all university links first
    const universityLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('.university-card a');
      return Array.from(links).map(link => link.href);
    });
    
    console.log(`Found ${universityLinks.length} university links`);
    
    // Array to store all universities
    const universities = [];
    // Array to store all programs
    const allPrograms = [];
    
    // Process each university
    for (let i = 0; i < universityLinks.length; i++) {
      const universityLink = universityLinks[i];
      console.log(`Visiting university ${i + 1}/${universityLinks.length}: ${universityLink}`);
      
      // Navigate to the university page
      await page.goto(universityLink, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Extract university details
      const universityData = await page.evaluate(() => {
        const nameElement = document.querySelector('h1.university-name');
        const locationElement = document.querySelector('p.university-location');
        const imageElement = document.querySelector('.university-banner img');
        
        const universityId = parseInt(window.location.pathname.split('/').pop());
        
        return {
          id: universityId,
          name: nameElement ? nameElement.textContent.trim() : `University ${universityId}`,
          location: locationElement ? locationElement.textContent.trim() : 'UAE',
          imageUrl: imageElement ? imageElement.src : ''
        };
      });
      
      // Add to universities array
      universities.push(universityData);
      
      // Extract program links for this university
      const programLinks = await page.evaluate(() => {
        const links = document.querySelectorAll('.program-card a');
        return Array.from(links).map(link => link.href);
      });
      
      console.log(`Found ${programLinks.length} programs for ${universityData.name}`);
      
      // Process each program
      for (let j = 0; j < programLinks.length; j++) {
        const programLink = programLinks[j];
        console.log(`Processing program ${j + 1}/${programLinks.length} for ${universityData.name}`);
        
        // Navigate to the program page
        await page.goto(programLink, {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        
        // Extract detailed program information
        const programData = await page.evaluate((universityId, universityName) => {
          // Basic program info
          const nameElement = document.querySelector('h1.program-name');
          const programId = parseInt(window.location.pathname.split('/').pop());
          
          // Program details from tabs or sections
          const detailsElements = document.querySelectorAll('.program-details li, .program-tab-content p');
          
          // Extract details with more sophisticated parsing
          let degree = '';
          let duration = '';
          let tuition = '';
          let intake = '';
          let studyField = '';
          let hasScholarship = false;
          let requirements = [];
          
          // Look for degree level
          const degreeElement = document.querySelector('.program-degree, .degree-level');
          if (degreeElement) {
            degree = degreeElement.textContent.trim();
          }
          
          // Look for duration
          const durationElement = document.querySelector('.program-duration, .duration');
          if (durationElement) {
            duration = durationElement.textContent.replace('Duration:', '').trim();
          }
          
          // Look for tuition
          const tuitionElement = document.querySelector('.program-tuition, .tuition-fees');
          if (tuitionElement) {
            tuition = tuitionElement.textContent.replace('Tuition:', '').trim();
          }
          
          // Look for intake
          const intakeElement = document.querySelector('.program-intake, .intake-dates');
          if (intakeElement) {
            intake = intakeElement.textContent.replace('Intake:', '').trim();
          }
          
          // Look for study field
          const fieldElement = document.querySelector('.program-field, .study-field');
          if (fieldElement) {
            studyField = fieldElement.textContent.replace('Field:', '').trim();
          }
          
          // Look for scholarship info
          const scholarshipElement = document.querySelector('.scholarship-info, .has-scholarship');
          if (scholarshipElement) {
            hasScholarship = scholarshipElement.textContent.toLowerCase().includes('available') || 
                             scholarshipElement.textContent.toLowerCase().includes('yes');
          }
          
          // Extract requirements
          const requirementsElements = document.querySelectorAll('.entry-requirements li, .documents-needed li');
          if (requirementsElements.length > 0) {
            requirements = Array.from(requirementsElements).map(el => el.textContent.trim());
          }
          
          // Set defaults for missing values
          if (!degree) degree = nameElement.textContent.includes('Master') ? 'Master\'s Degree' : 
                              nameElement.textContent.includes('PhD') ? 'PhD' : 'Bachelor\'s Degree';
          
          if (!duration) duration = degree.includes('Bachelor') ? '4 years' : 
                                  degree.includes('Master') ? '2 years' : '3-5 years';
          
          if (!tuition) tuition = '35,000 AED/year';
          
          if (!intake) intake = 'September';
          
          // Determine study field from program name if not found
          if (!studyField) {
            const programName = nameElement.textContent.toLowerCase();
            if (programName.includes('engineering')) 
              studyField = 'Engineering';
            else if (programName.includes('computer') || programName.includes('it') || programName.includes('technology')) 
              studyField = 'Computer Science & IT';
            else if (programName.includes('medicine') || programName.includes('health') || programName.includes('nursing')) 
              studyField = 'Medicine & Health';
            else if (programName.includes('art') || programName.includes('design') || programName.includes('literature')) 
              studyField = 'Arts & Humanities';
            else 
              studyField = 'Business & Management';
          }
          
          // Default requirements if none found
          if (requirements.length === 0) {
            if (degree.includes('Bachelor')) {
              requirements = ['High School Certificate', 'IELTS 6.0'];
            } else if (degree.includes('Master')) {
              requirements = ['Bachelor\'s Degree', 'IELTS 6.5', 'GPA 3.0'];
            } else {
              requirements = ['Master\'s Degree', 'IELTS 7.0', 'Research Proposal'];
            }
          }
          
          // Get the program image
          const imageElement = document.querySelector('.program-image img, .program-banner img');
          const imageUrl = imageElement ? imageElement.src : '';
          
          return {
            id: programId,
            name: nameElement ? nameElement.textContent.trim() : `Program ${programId}`,
            universityId,
            universityName,
            tuition,
            duration,
            intake,
            degree,
            studyField,
            requirements,
            hasScholarship,
            imageUrl
          };
        }, universityData.id, universityData.name);
        
        // Add to programs array
        allPrograms.push(programData);
        
        // Add a small delay to avoid overwhelming the server
        await page.waitForTimeout(500);
      }
    }
    
    console.log(`Completed scraping. Found ${universities.length} universities and ${allPrograms.length} programs.`);
    
    // Save data to files
    await fs.writeFile(
      path.join(__dirname, 'scraped-universities.json'),
      JSON.stringify(universities, null, 2)
    );
    
    await fs.writeFile(
      path.join(__dirname, 'scraped-programs.json'),
      JSON.stringify(allPrograms, null, 2)
    );
    
    console.log('Data saved to scraped-universities.json and scraped-programs.json');
    
    return {
      universities,
      programs: allPrograms
    };
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

// Execute the function when script is run directly
if (require.main === module) {
  scrapeEducationalData()
    .then(() => {
      console.log('Scraping completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Scraping failed:', error);
      process.exit(1);
    });
}

module.exports = { scrapeEducationalData };