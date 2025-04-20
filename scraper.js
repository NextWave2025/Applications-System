const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Scrapes university and program data from the provided URL
 */
async function scrapeEducationalData() {
  console.log('Starting data scraping process...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: true
  });
  
  try {
    console.log('Browser launched, navigating to page...');
    const page = await browser.newPage();
    
    // Navigate to the main page
    await page.goto('https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    console.log('Page loaded. Extracting universities...');
    
    // Get all universities
    const universities = await page.evaluate(() => {
      const universityElements = document.querySelectorAll('.university-card');
      return Array.from(universityElements).map((element, index) => {
        // Get the university name and location
        const name = element.querySelector('h3')?.textContent.trim() || `University ${index + 1}`;
        const location = element.querySelector('p')?.textContent.trim() || 'UAE';
        
        // Get the university image URL (if available)
        const imageUrl = element.querySelector('img')?.src || '';
        
        // Get the university ID from the link
        const link = element.querySelector('a')?.href || '';
        const id = link.split('/').pop() || (index + 1).toString();
        
        return {
          id: parseInt(id),
          name,
          location,
          imageUrl
        };
      });
    });
    
    console.log(`Found ${universities.length} universities. Now scraping program data...`);
    
    // Array to store all programs
    const allPrograms = [];
    
    // For each university, get its programs
    for (let i = 0; i < universities.length; i++) {
      const university = universities[i];
      console.log(`Scraping programs for ${university.name} (${i + 1}/${universities.length})...`);
      
      // Navigate to the university page
      await page.goto(`https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/university/${university.id}`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Get all programs for this university
      const programs = await page.evaluate((universityId, universityName) => {
        const programElements = document.querySelectorAll('.program-card');
        return Array.from(programElements).map((element, index) => {
          // Get basic program info
          const name = element.querySelector('h3')?.textContent.trim() || `Program ${index + 1}`;
          
          // Get program details
          const details = element.querySelectorAll('.program-detail');
          
          // Extract details - order might vary, so we check text content
          let degree = 'Bachelor\'s Degree'; // Default
          let duration = '4 years'; // Default
          let tuition = '35,000 AED/year'; // Default
          let intake = 'September'; // Default
          
          details.forEach(detail => {
            const label = detail.querySelector('strong')?.textContent.trim().toLowerCase() || '';
            const value = detail.textContent.replace(label, '').trim();
            
            if (label.includes('degree')) degree = value;
            else if (label.includes('duration')) duration = value;
            else if (label.includes('tuition')) tuition = value;
            else if (label.includes('intake')) intake = value;
          });
          
          // Get study field - using the degree as a hint
          let studyField = 'Business & Management'; // Default
          if (name.toLowerCase().includes('engineering')) studyField = 'Engineering';
          else if (name.toLowerCase().includes('computer') || name.toLowerCase().includes('it') || name.toLowerCase().includes('technology')) studyField = 'Computer Science & IT';
          else if (name.toLowerCase().includes('medicine') || name.toLowerCase().includes('health') || name.toLowerCase().includes('nursing')) studyField = 'Medicine & Health';
          else if (name.toLowerCase().includes('art') || name.toLowerCase().includes('design') || name.toLowerCase().includes('literature') || name.toLowerCase().includes('history')) studyField = 'Arts & Humanities';
          
          // Determine if scholarship is available (random for now, replace with actual data if available)
          const hasScholarship = Math.random() > 0.5;
          
          // Get requirements (random for now, replace with actual data if available)
          const requirements = [];
          if (degree.toLowerCase().includes('bachelor')) {
            requirements.push('High School Certificate');
            requirements.push('IELTS 6.0');
          } else if (degree.toLowerCase().includes('master')) {
            requirements.push('Bachelor\'s Degree');
            requirements.push('IELTS 6.5');
            requirements.push('GPA 3.0');
          } else if (degree.toLowerCase().includes('phd')) {
            requirements.push('Master\'s Degree');
            requirements.push('IELTS 7.0');
            requirements.push('Research Proposal');
          }
          
          // Get the program URL from the link
          const link = element.querySelector('a')?.href || '';
          const id = link.split('/').pop() || (index + 1).toString();
          
          return {
            id: parseInt(id),
            name,
            universityId,
            universityName,
            tuition,
            duration,
            intake,
            degree,
            studyField,
            requirements,
            hasScholarship,
            imageUrl: element.querySelector('img')?.src || ''
          };
        });
      }, university.id, university.name);
      
      // Add programs to the full list
      allPrograms.push(...programs);
      
      // Add a small delay to avoid overwhelming the server
      await page.waitForTimeout(1000);
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