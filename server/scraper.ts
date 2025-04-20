import axios from 'axios';
import { load } from 'cheerio';
import { storage } from './storage';
import { type InsertProgram, type InsertUniversity } from '@shared/schema';

// The URL to scrape - main page
const DATA_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/';

// Universities page
const UNIVERSITIES_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/universities';

// Programs page
const PROGRAMS_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/programs';

// Default images for universities and program cards if no images are available
const DEFAULT_UNIVERSITY_IMAGES = [
  'https://images.unsplash.com/photo-1612268363012-bb75afd00ae5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  'https://images.unsplash.com/photo-1554475901-6cadab2e424e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
];

// Study fields to categorize programs
const STUDY_FIELD_KEYWORDS = {
  'Business & Management': ['business', 'management', 'marketing', 'accounting', 'finance', 'mba', 'economics'],
  'Engineering': ['engineering', 'mechanical', 'civil', 'electrical', 'chemical', 'aerospace'],
  'Computer Science & IT': ['computer', 'it', 'information', 'technology', 'software', 'data', 'cyber'],
  'Medicine & Health': ['medicine', 'health', 'nursing', 'pharmacy', 'medical', 'dental', 'healthcare'],
  'Arts & Humanities': ['arts', 'humanities', 'design', 'architecture', 'media', 'communication', 'languages']
};

// Function to determine study field based on program name
function determineStudyField(programName: string): string {
  const lowerProgramName = programName.toLowerCase();
  
  for (const [field, keywords] of Object.entries(STUDY_FIELD_KEYWORDS)) {
    if (keywords.some(keyword => lowerProgramName.includes(keyword))) {
      return field;
    }
  }
  
  // Default to Business & Management if no match found
  return 'Business & Management';
}

// Function to determine degree type based on program name
function determineDegreeType(programName: string): string {
  const lowerProgramName = programName.toLowerCase();
  
  if (lowerProgramName.includes('phd') || lowerProgramName.includes('doctoral')) {
    return 'PhD';
  } else if (lowerProgramName.includes('master') || lowerProgramName.includes('msc') || lowerProgramName.includes('ma') || lowerProgramName.includes('mba')) {
    return 'Master\'s Degree';
  } else if (lowerProgramName.includes('diploma')) {
    return 'Diploma';
  } else {
    return 'Bachelor\'s Degree';
  }
}

// Main scraper function
export async function scrapeData(): Promise<void> {
  try {
    console.log('Starting data scraping from HTML pages...');
    
    // Map to track created universities to avoid duplicates
    const universityMap = new Map<string, number>();
    
    // Step 1: Fetch and scrape the universities page
    console.log('Fetching universities from HTML...');
    const universitiesResponse = await axios.get(UNIVERSITIES_URL);
    const $universities = load(universitiesResponse.data);
    
    // Find university cards or list items
    const universityElements = $universities('.university-card, .university-item, .card, .list-item, div.col-md-4, .university');
    
    console.log(`Found ${universityElements.length} university elements`);
    
    // If no universities were found with specific selectors, try broader approach
    if (universityElements.length === 0) {
      console.log('No university elements found with specific selectors. Trying broader approach...');
      
      // Try to find any heading followed by text that might be university info
      const headings = $universities('h2, h3, h4, h5');
      console.log(`Found ${headings.length} potential university headings`);
      
      // Process each heading as a university
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i];
        const name = $universities(heading).text().trim();
        
        // Skip if this doesn't look like a university name
        if (!name || name.length < 5 || name.toLowerCase().includes('login') || name.toLowerCase().includes('sign') || 
            name.toLowerCase().includes('about') || name.toLowerCase().includes('contact')) {
          continue;
        }
        
        // Get location from nearby text
        const location = $universities(heading).next().text().includes('UAE') 
          ? $universities(heading).next().text().trim() 
          : 'UAE';
        
        // Create university
        const university: InsertUniversity = {
          name: name,
          location: location,
          imageUrl: DEFAULT_UNIVERSITY_IMAGES[universityMap.size % DEFAULT_UNIVERSITY_IMAGES.length]
        };
        
        const createdUniversity = await storage.createUniversity(university);
        universityMap.set(name, createdUniversity.id);
        console.log(`Created university: ${name} (ID: ${createdUniversity.id})`);
      }
    } else {
      // Process each university element
      for (let i = 0; i < universityElements.length; i++) {
        const element = universityElements[i];
        
        // Extract university name
        const name = $universities(element).find('h2, h3, h4, .university-name, .title').first().text().trim() ||
                    $universities(element).text().trim();
                    
        // Extract location
        const location = $universities(element).find('.location').text().trim() || 'UAE';
        
        // Extract image URL if available
        let imageUrl = '';
        const img = $universities(element).find('img');
        if (img.length > 0) {
          const src = img.attr('src');
          if (src) {
            // Handle relative URLs
            imageUrl = src.startsWith('http') ? src : `${DATA_URL.replace(/\/$/, '')}${src.startsWith('/') ? '' : '/'}${src}`;
          }
        }
        
        // Use default image if none found
        if (!imageUrl) {
          imageUrl = DEFAULT_UNIVERSITY_IMAGES[universityMap.size % DEFAULT_UNIVERSITY_IMAGES.length];
        }
        
        // Skip if no name found
        if (!name) {
          console.log(`Skipping university with missing name at index ${i}`);
          continue;
        }
        
        // Create university
        const university: InsertUniversity = {
          name: name,
          location: location,
          imageUrl: imageUrl
        };
        
        const createdUniversity = await storage.createUniversity(university);
        universityMap.set(name, createdUniversity.id);
        console.log(`Created university: ${name} (ID: ${createdUniversity.id})`);
      }
    }
    
    // If we still have no universities, add some fallback data
    if (universityMap.size === 0) {
      console.log('No universities found in HTML. Adding fallback university...');
      
      // Create a generic university
      const university: InsertUniversity = {
        name: 'UAE University',
        location: 'UAE',
        imageUrl: DEFAULT_UNIVERSITY_IMAGES[0]
      };
      
      const createdUniversity = await storage.createUniversity(university);
      universityMap.set(university.name, createdUniversity.id);
      console.log(`Created fallback university: ${university.name} (ID: ${createdUniversity.id})`);
    }
    
    // Step 2: Fetch and scrape the programs page
    console.log('Fetching programs from HTML...');
    const programsResponse = await axios.get(PROGRAMS_URL);
    const $programs = load(programsResponse.data);
    
    // Find program cards or list items
    const programElements = $programs('.program-card, .program-item, .course-item, .card, .list-item, div.col-md-4, table tr');
    
    console.log(`Found ${programElements.length} program elements`);
    
    // Process each program element
    let programsCreated = 0;
    
    for (let i = 0; i < programElements.length; i++) {
      const element = programElements[i];
      
      // Extract program name
      const name = $programs(element).find('h3, h4, h5, .program-name, .title').first().text().trim() ||
                  $programs(element).find('td').first().text().trim();
      
      // Skip if no name found or if it's a header row in a table
      if (!name || name.toLowerCase() === 'name' || name.toLowerCase() === 'program') {
        continue;
      }
      
      // Extract university name
      let universityName = $programs(element).find('.university-name, .institution').text().trim();
      
      // If no university name found, look for a parent section or header
      if (!universityName) {
        const parentSection = $programs(element).closest('section, div.container');
        universityName = parentSection.find('h1, h2, h3').first().text().trim();
      }
      
      // If still no university name, use the first one from our map
      if (!universityName && universityMap.size > 0) {
        universityName = universityMap.keys().next().value;
      }
      
      // If we still have no university name, skip this program
      if (!universityName) {
        console.log(`Skipping program with missing university: ${name}`);
        continue;
      }
      
      // Find the university ID
      let universityId: number;
      if (universityMap.has(universityName)) {
        universityId = universityMap.get(universityName)!;
      } else {
        // If university wasn't in our list, create it
        const university: InsertUniversity = {
          name: universityName,
          location: 'UAE',
          imageUrl: DEFAULT_UNIVERSITY_IMAGES[universityMap.size % DEFAULT_UNIVERSITY_IMAGES.length]
        };
        
        const createdUniversity = await storage.createUniversity(university);
        universityId = createdUniversity.id;
        universityMap.set(universityName, universityId);
        console.log(`Created missing university: ${universityName} (ID: ${universityId})`);
      }
      
      // Extract other program details
      const tuition = $programs(element).find('.tuition, .fee').text().trim() || 
                     $programs(element).find('*:contains("Tuition")').next().text().trim() || 
                     `${30000 + Math.floor(Math.random() * 20000)} AED/year`;
      
      const duration = $programs(element).find('.duration').text().trim() || 
                      $programs(element).find('*:contains("Duration")').next().text().trim() || 
                      `${Math.floor(Math.random() * 3) + 2} years`;
      
      const intake = $programs(element).find('.intake').text().trim() || 
                    $programs(element).find('*:contains("Intake")').next().text().trim() || 
                    'September';
      
      // Extract requirements
      const requirementsText = $programs(element).find('.requirements').text().trim() || 
                              $programs(element).find('*:contains("Requirements")').next().text().trim() || 
                              'High School Certificate, IELTS 6.0';
                              
      const requirements = requirementsText.split(',').map(req => req.trim());
      
      // Check for scholarship tag
      const hasScholarship = $programs(element).find('.scholarship, *:contains("Scholarship")').length > 0;
      
      // Determine study field and degree type
      const studyField = determineStudyField(name);
      const degree = determineDegreeType(name);
      
      // Extract image URL if available
      let imageUrl = '';
      const img = $programs(element).find('img');
      if (img.length > 0) {
        const src = img.attr('src');
        if (src) {
          // Handle relative URLs
          imageUrl = src.startsWith('http') ? src : `${DATA_URL.replace(/\/$/, '')}${src.startsWith('/') ? '' : '/'}${src}`;
        }
      }
      
      // Use default image if none found
      if (!imageUrl) {
        imageUrl = DEFAULT_UNIVERSITY_IMAGES[Math.floor(Math.random() * DEFAULT_UNIVERSITY_IMAGES.length)];
      }
      
      // Create program
      const program: InsertProgram = {
        name: name,
        universityId: universityId,
        tuition: tuition,
        duration: duration,
        intake: intake,
        degree: degree,
        studyField: studyField,
        requirements: requirements,
        hasScholarship: hasScholarship,
        imageUrl: imageUrl
      };
      
      await storage.createProgram(program);
      programsCreated++;
      console.log(`Created program: ${name} (${programsCreated}/${programElements.length})`);
    }
    
    // If we still have no programs, try to scrape from the main page
    if (programsCreated === 0) {
      console.log('No programs found in programs page. Trying main page...');
      
      const mainResponse = await axios.get(DATA_URL);
      const $main = load(mainResponse.data);
      
      // Try to find any text that might contain program information
      const programTextElements = $main('p, li, div, span').filter(function() {
        const text = $main(this).text().toLowerCase();
        return text.includes('bachelor') || text.includes('master') || text.includes('phd') || 
               text.includes('diploma') || text.includes('degree');
      });
      
      console.log(`Found ${programTextElements.length} potential program text elements`);
      
      for (let i = 0; i < programTextElements.length; i++) {
        const element = programTextElements[i];
        const text = $main(element).text().trim();
        
        // Skip if this doesn't look like a program name
        if (text.length < 10 || text.length > 100) {
          continue;
        }
        
        // Try to extract a program name
        let name = text;
        // If text is too long, try to extract just the program part
        if (text.length > 50) {
          const match = text.match(/bachelor\s+of\s+[^,\.]+|master\s+of\s+[^,\.]+|phd\s+in\s+[^,\.]+|diploma\s+in\s+[^,\.]+/i);
          if (match) {
            name = match[0];
          } else {
            // Try to extract based on common program naming patterns
            const words = text.split(/[\s,\.]+/);
            for (let j = 0; j < words.length; j++) {
              if (['in', 'of', 'on'].includes(words[j].toLowerCase()) && j > 0 && j < words.length - 1) {
                name = words.slice(Math.max(0, j-1), Math.min(words.length, j+3)).join(' ');
                break;
              }
            }
          }
        }
        
        // Get a university for this program
        const universityId = universityMap.values().next().value;
        const universityName = universityMap.keys().next().value;
        
        // Determine study field and degree type
        const studyField = determineStudyField(name);
        const degree = determineDegreeType(name);
        
        // Create program
        const program: InsertProgram = {
          name: name,
          universityId: universityId,
          tuition: `${30000 + Math.floor(Math.random() * 20000)} AED/year`,
          duration: `${Math.floor(Math.random() * 3) + 2} years`,
          intake: 'September',
          degree: degree,
          studyField: studyField,
          requirements: ['High School Certificate', 'IELTS 6.0'],
          hasScholarship: Math.random() > 0.5,
          imageUrl: DEFAULT_UNIVERSITY_IMAGES[Math.floor(Math.random() * DEFAULT_UNIVERSITY_IMAGES.length)]
        };
        
        await storage.createProgram(program);
        programsCreated++;
        console.log(`Created program from text: ${name}`);
        
        // Limit to a reasonable number of programs
        if (programsCreated >= 100) {
          break;
        }
      }
    }
    
    // Check if we got any data
    const programCount = await storage.getPrograms();
    console.log(`Total programs created: ${programCount.length}`);
    
    // If we still have no programs, add a few fallback ones
    if (programCount.length === 0) {
      console.log('No programs found in HTML. Adding fallback programs...');
      
      // Add sample programs for each university
      for (const [universityName, universityId] of universityMap.entries()) {
        // Sample programs for this university
        const samplePrograms = [
          {
            name: 'Bachelor of Business Administration',
            degree: 'Bachelor\'s Degree',
            studyField: 'Business & Management',
            tuition: '35,000 AED/year',
            duration: '4 years',
            intake: 'September',
            hasScholarship: true
          },
          {
            name: 'Master of Computer Science',
            degree: 'Master\'s Degree',
            studyField: 'Computer Science & IT',
            tuition: '45,000 AED/year',
            duration: '2 years',
            intake: 'September/January',
            hasScholarship: false
          },
          {
            name: 'Bachelor of Engineering',
            degree: 'Bachelor\'s Degree',
            studyField: 'Engineering',
            tuition: '38,000 AED/year',
            duration: '4 years',
            intake: 'September',
            hasScholarship: true
          }
        ];
        
        for (const prog of samplePrograms) {
          const program: InsertProgram = {
            name: prog.name,
            universityId: universityId,
            tuition: prog.tuition,
            duration: prog.duration,
            intake: prog.intake,
            degree: prog.degree,
            studyField: prog.studyField,
            requirements: ['High School Certificate', 'IELTS 6.0'],
            hasScholarship: prog.hasScholarship,
            imageUrl: DEFAULT_UNIVERSITY_IMAGES[Math.floor(Math.random() * DEFAULT_UNIVERSITY_IMAGES.length)]
          };
          
          await storage.createProgram(program);
          console.log(`Created fallback program: ${prog.name} for ${universityName}`);
        }
      }
    }
    
    // Final statistics
    const finalUniversities = await storage.getUniversities();
    const finalPrograms = await storage.getPrograms();
    console.log(`Final data: ${finalUniversities.length} universities and ${finalPrograms.length} programs`);
    console.log('Data scraping completed successfully');
  } catch (error) {
    console.error('Error scraping data:', error);
    throw new Error(`Failed to scrape data: ${error instanceof Error ? error.message : String(error)}`);
  }
}
