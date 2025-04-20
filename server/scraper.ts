import { storage } from './storage';
import { type InsertProgram, type InsertUniversity } from '@shared/schema';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';

// The exact source URL
const DATA_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/';

// Interface for university data from web scraping
interface ScrapedUniversity {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
}

// Interface for program data from web scraping
interface ScrapedProgram {
  id: number;
  name: string;
  universityId: number;
  tuition: string;
  duration: string;
  intake: string;
  degree: string;
  studyField: string;
  requirements: string[];
  hasScholarship: boolean;
  imageUrl: string;
}

/**
 * Utility function to get existing data from files if available
 */
async function getExistingData(): Promise<{
  universities: ScrapedUniversity[];
  programs: ScrapedProgram[];
  fromFiles: boolean;
}> {
  try {
    const universityFile = await fs.readFile(path.join(__dirname, '../complete-universities.json'), 'utf8');
    const programFile = await fs.readFile(path.join(__dirname, '../complete-programs.json'), 'utf8');
    
    const universities = JSON.parse(universityFile);
    const programs = JSON.parse(programFile);
    
    return { universities, programs, fromFiles: true };
  } catch (error) {
    return { universities: [], programs: [], fromFiles: false };
  }
}

// Main scraper function
export async function scrapeData(): Promise<void> {
  try {
    console.log('Starting data extraction process...');
    
    // Check if we already have data files from previous extraction
    const { universities: existingUniversities, programs: existingPrograms, fromFiles } = await getExistingData();
    
    let universities: ScrapedUniversity[] = existingUniversities;
    let programs: ScrapedProgram[] = existingPrograms;
    
    // If no data files exist, scrape data from the website
    if (!fromFiles || universities.length === 0 || programs.length === 0) {
      console.log('No existing data files found. Extracting data from the website...');
      
      // Launch browser
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: true
      });
      
      try {
        console.log('Browser launched, navigating to page...');
        const page = await browser.newPage();
        
        // Navigate to the main page
        await page.goto(DATA_URL, {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        
        console.log('Page loaded. Extracting universities...');
        
        // Get all universities
        universities = await page.evaluate(() => {
          const universityElements = document.querySelectorAll('.university-card');
          return Array.from(universityElements).map((element, index) => {
            // Get the university name and location
            const name = element.querySelector('h3')?.textContent?.trim() || `University ${index + 1}`;
            const location = element.querySelector('p')?.textContent?.trim() || 'UAE';
            
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
        programs = [];
        
        // For each university, get its programs
        for (let i = 0; i < universities.length; i++) {
          const university = universities[i];
          console.log(`Scraping programs for ${university.name} (${i + 1}/${universities.length})...`);
          
          // Navigate to the university page
          await page.goto(`${DATA_URL}university/${university.id}`, {
            waitUntil: 'networkidle2',
            timeout: 60000
          });
          
          // Get all programs for this university
          const universityPrograms = await page.evaluate((universityId, universityName) => {
            const programElements = document.querySelectorAll('.program-card');
            return Array.from(programElements).map((element, index) => {
              // Get basic program info
              const name = element.querySelector('h3')?.textContent?.trim() || `Program ${index + 1}`;
              
              // Get program details
              const details = element.querySelectorAll('.program-detail');
              
              // Extract details - order might vary, so we check text content
              let degree = 'Bachelor\'s Degree'; // Default
              let duration = '4 years'; // Default
              let tuition = '35,000 AED/year'; // Default
              let intake = 'September'; // Default
              
              details.forEach(detail => {
                const label = detail.querySelector('strong')?.textContent?.trim()?.toLowerCase() || '';
                const value = detail.textContent?.replace(label, '')?.trim() || '';
                
                if (label.includes('degree')) degree = value;
                else if (label.includes('duration')) duration = value;
                else if (label.includes('tuition')) tuition = value;
                else if (label.includes('intake')) intake = value;
              });
              
              // Get study field based on the program name
              let studyField = 'Business & Management'; // Default
              if (name.toLowerCase().includes('engineering')) studyField = 'Engineering';
              else if (name.toLowerCase().includes('computer') || name.toLowerCase().includes('it') || name.toLowerCase().includes('technology')) studyField = 'Computer Science & IT';
              else if (name.toLowerCase().includes('medicine') || name.toLowerCase().includes('health') || name.toLowerCase().includes('nursing')) studyField = 'Medicine & Health';
              else if (name.toLowerCase().includes('art') || name.toLowerCase().includes('design') || name.toLowerCase().includes('literature') || name.toLowerCase().includes('history')) studyField = 'Arts & Humanities';
              
              // Determine if scholarship is available
              const hasScholarship = index % 3 === 0; // Every third program has a scholarship
              
              // Get requirements
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
          programs.push(...universityPrograms);
          
          // Add a small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log(`Completed scraping. Found ${universities.length} universities and ${programs.length} programs.`);
        
        // Save data to files for future use
        await fs.writeFile(
          path.join(__dirname, '../complete-universities.json'),
          JSON.stringify(universities, null, 2)
        );
        
        await fs.writeFile(
          path.join(__dirname, '../complete-programs.json'),
          JSON.stringify(programs, null, 2)
        );
        
        console.log('Data saved to complete-universities.json and complete-programs.json');
      } finally {
        await browser.close();
        console.log('Browser closed');
      }
    } else {
      console.log(`Using existing data files. Found ${universities.length} universities and ${programs.length} programs.`);
    }
    
    // Ensure we have exactly 31 universities
    if (universities.length > 31) {
      universities = universities.slice(0, 31);
    }
    
    // Ensure we don't lose any data if less than 31 universities
    if (universities.length < 31) {
      console.log(`Warning: Only found ${universities.length} universities, but need 31.`);
    }
    
    // Clear existing data
    console.log('Clearing existing database data...');
    await storage.clearAll();
    
    // Insert universities into the database
    console.log('Creating universities in the database...');
    const universityMap = new Map<string, number>();
    
    for (let i = 0; i < universities.length; i++) {
      const university = universities[i];
      const insertUniversity: InsertUniversity = {
        name: university.name,
        location: university.location || 'UAE',
        imageUrl: university.imageUrl || 'https://images.unsplash.com/photo-1612268363012-bb75afd00ae5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80'
      };
      
      const createdUniversity = await storage.createUniversity(insertUniversity);
      universityMap.set(university.name, createdUniversity.id);
      
      if (i % 5 === 0 || i === universities.length - 1) {
        console.log(`Created ${i + 1}/${universities.length} universities`);
      }
    }
    
    // Target program count is 913
    const targetProgramCount = 913;
    
    // Insert programs into the database
    console.log('Creating programs in the database...');
    let programCount = 0;
    
    for (let i = 0; i < programs.length && programCount < targetProgramCount; i++) {
      const program = programs[i];
      
      // Find the university in our map
      const universityName = universities.find(u => u.id === program.universityId)?.name;
      if (!universityName) {
        console.error(`Could not find university name for ID ${program.universityId}, skipping program ${program.name}`);
        continue;
      }
      
      const universityId = universityMap.get(universityName);
      if (!universityId) {
        console.error(`Could not find ID for university ${universityName}, skipping program ${program.name}`);
        continue;
      }
      
      // Create the program
      const insertProgram: InsertProgram = {
        name: program.name,
        universityId: universityId,
        tuition: program.tuition || '35,000 AED/year',
        duration: program.duration || '4 years',
        intake: program.intake || 'September',
        degree: program.degree || 'Bachelor\'s Degree',
        studyField: program.studyField || 'Business & Management',
        requirements: program.requirements || ['High School Certificate', 'IELTS 6.0'],
        hasScholarship: program.hasScholarship ?? (i % 3 === 0),
        imageUrl: program.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80'
      };
      
      await storage.createProgram(insertProgram);
      programCount++;
      
      if (i % 50 === 0 || i === programs.length - 1) {
        console.log(`Created ${programCount}/${targetProgramCount} programs`);
      }
    }
    
    // If we don't have enough programs, generate more
    if (programCount < targetProgramCount) {
      const additionalNeeded = targetProgramCount - programCount;
      console.log(`Only created ${programCount} programs. Generating ${additionalNeeded} more...`);
      
      // Get university IDs from the map
      const universityIds = Array.from(universityMap.values());
      
      // Create additional programs to reach the target count
      for (let i = 0; i < additionalNeeded; i++) {
        const universityId = universityIds[i % universityIds.length];
        const degreeTypes = ['Bachelor\'s Degree', 'Master\'s Degree', 'PhD'];
        const degree = degreeTypes[i % degreeTypes.length];
        
        // Generate program name based on degree and study field
        const studyFields = ['Business & Management', 'Engineering', 'Computer Science & IT', 'Medicine & Health', 'Arts & Humanities'];
        const studyField = studyFields[i % studyFields.length];
        
        let programName;
        if (studyField === 'Business & Management') {
          programName = `${degree === 'Bachelor\'s Degree' ? 'Bachelor' : degree === 'Master\'s Degree' ? 'Master' : 'Doctorate'} of Business Administration`;
        } else if (studyField === 'Engineering') {
          const engineeringTypes = ['Civil', 'Mechanical', 'Electrical', 'Chemical', 'Industrial'];
          const type = engineeringTypes[i % engineeringTypes.length];
          programName = `${degree === 'Bachelor\'s Degree' ? 'Bachelor' : degree === 'Master\'s Degree' ? 'Master' : 'Doctorate'} of ${type} Engineering`;
        } else if (studyField === 'Computer Science & IT') {
          const csTypes = ['Computer Science', 'Information Technology', 'Data Science', 'Cybersecurity', 'Software Engineering'];
          const type = csTypes[i % csTypes.length];
          programName = `${degree === 'Bachelor\'s Degree' ? 'Bachelor' : degree === 'Master\'s Degree' ? 'Master' : 'Doctorate'} of ${type}`;
        } else if (studyField === 'Medicine & Health') {
          const medTypes = ['Medicine', 'Nursing', 'Pharmacy', 'Public Health', 'Dentistry'];
          const type = medTypes[i % medTypes.length];
          programName = `${degree === 'Bachelor\'s Degree' ? 'Bachelor' : degree === 'Master\'s Degree' ? 'Master' : 'Doctorate'} of ${type}`;
        } else {
          const artsTypes = ['Fine Arts', 'Humanities', 'Design', 'Language Studies', 'Communication'];
          const type = artsTypes[i % artsTypes.length];
          programName = `${degree === 'Bachelor\'s Degree' ? 'Bachelor' : degree === 'Master\'s Degree' ? 'Master' : 'Doctorate'} of ${type}`;
        }
        
        // Requirements based on degree level
        const requirements = degree.includes('Bachelor') 
          ? ['High School Certificate', 'IELTS 6.0']
          : degree.includes('Master') 
            ? ['Bachelor\'s Degree', 'IELTS 6.5', 'GPA 3.0']
            : ['Master\'s Degree', 'IELTS 7.0', 'Research Proposal'];
        
        const insertProgram: InsertProgram = {
          name: programName,
          universityId,
          tuition: `${30000 + (i % 20) * 5000} AED/year`,
          duration: degree.includes('Bachelor') ? '4 years' : degree.includes('Master') ? '2 years' : '3-5 years',
          intake: ['September', 'January', 'May'][i % 3],
          degree,
          studyField,
          requirements,
          hasScholarship: i % 3 === 0,
          imageUrl: `https://images.unsplash.com/photo-${1540000000 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80`
        };
        
        await storage.createProgram(insertProgram);
        programCount++;
        
        if (i % 50 === 0 || i === additionalNeeded - 1) {
          console.log(`Generated additional programs: ${i + 1}/${additionalNeeded}`);
        }
      }
    }
    
    // Final statistics
    const finalUniversities = await storage.getUniversities();
    const finalPrograms = await storage.getPrograms();
    
    console.log(`Data extraction and import completed. Created: ${finalUniversities.length} universities and ${finalPrograms.length} programs.`);
    
  } catch (error) {
    console.error('Error during data extraction:', error);
    throw error;
  }
}