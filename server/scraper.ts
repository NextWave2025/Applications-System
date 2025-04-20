import axios from 'axios';
import { load } from 'cheerio';
import { storage } from './storage';
import { type InsertProgram, type InsertUniversity } from '@shared/schema';

// The URL to scrape
const DATA_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/';

// University list endpoint
const UNIVERSITIES_API_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/api/universities';

// Programs list endpoint
const PROGRAMS_API_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/api/programs';

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
    console.log('Starting data scraping from API sources...');
    
    // Map to track created universities to avoid duplicates
    const universityMap = new Map<string, number>();
    
    // Step 1: Fetch all universities
    console.log('Fetching universities from API...');
    const universitiesResponse = await axios.get(UNIVERSITIES_API_URL);
    const universities = universitiesResponse.data;
    
    console.log(`Found ${universities.length} universities`);
    
    // Step 2: Create all universities first
    for (const uni of universities) {
      // Create a standardized university entry
      const university: InsertUniversity = {
        name: uni.name,
        location: uni.location || 'UAE',
        imageUrl: uni.imageUrl || uni.logo || DEFAULT_UNIVERSITY_IMAGES[universityMap.size % DEFAULT_UNIVERSITY_IMAGES.length]
      };
      
      const createdUniversity = await storage.createUniversity(university);
      universityMap.set(uni.name, createdUniversity.id);
      console.log(`Created university: ${uni.name} (ID: ${createdUniversity.id})`);
    }
    
    // Step 3: Fetch all programs
    console.log('Fetching programs from API...');
    const programsResponse = await axios.get(PROGRAMS_API_URL);
    const programs = programsResponse.data;
    
    console.log(`Found ${programs.length} programs`);
    
    // Step 4: Create all programs
    for (const prog of programs) {
      // Find the university ID for this program
      let universityId: number;
      const universityName = prog.university?.name || prog.universityName;
      
      if (!universityName) {
        console.log(`Skipping program with missing university: ${prog.name || 'Unknown'}`);
        continue;
      }
      
      if (universityMap.has(universityName)) {
        universityId = universityMap.get(universityName)!;
      } else {
        // If the university wasn't in our initial list, create it
        const imageUrl = DEFAULT_UNIVERSITY_IMAGES[universityMap.size % DEFAULT_UNIVERSITY_IMAGES.length];
        
        const university: InsertUniversity = {
          name: universityName,
          location: 'UAE',
          imageUrl: imageUrl
        };
        
        const createdUniversity = await storage.createUniversity(university);
        universityId = createdUniversity.id;
        universityMap.set(universityName, universityId);
        console.log(`Created missing university: ${universityName} (ID: ${universityId})`);
      }
      
      // Extract or generate requirements
      let requirements: string[] = [];
      if (prog.requirements) {
        if (Array.isArray(prog.requirements)) {
          requirements = prog.requirements;
        } else if (typeof prog.requirements === 'string') {
          requirements = prog.requirements.split(',').map(req => req.trim());
        }
      } else {
        requirements = ['High School Certificate', 'IELTS 6.0'];
      }
      
      // Determine study field and degree type from the program name
      const studyField = prog.studyField || determineStudyField(prog.name);
      const degree = prog.degree || prog.degreeLevel || determineDegreeType(prog.name);
      
      // Create program entry
      const program: InsertProgram = {
        name: prog.name,
        universityId: universityId,
        tuition: prog.tuition || prog.tuitionFee || `${30000 + Math.floor(Math.random() * 20000)} AED/year`,
        duration: prog.duration || '4 years',
        intake: prog.intake || 'September',
        degree: degree,
        studyField: studyField,
        requirements: requirements,
        hasScholarship: !!prog.hasScholarship || prog.scholarship === true,
        imageUrl: prog.imageUrl || DEFAULT_UNIVERSITY_IMAGES[Math.floor(Math.random() * DEFAULT_UNIVERSITY_IMAGES.length)]
      };
      
      await storage.createProgram(program);
      console.log(`Created program: ${prog.name}`);
    }
    
    // Check if we got any data
    const programCount = await storage.getPrograms();
    console.log(`Total programs created: ${programCount.length}`);
    
    if (programCount.length === 0) {
      console.log('No programs found from API. Falling back to HTML scraping...');
      
      // Try to scrape from HTML as a fallback
      const response = await axios.get(DATA_URL);
      const $ = load(response.data);
      
      // Scrape programs
      const programElements = $('div.program-card, div.course-item, div.program-listing');
      
      console.log(`Found ${programElements.length} program elements from HTML`);
      
      for (let i = 0; i < programElements.length; i++) {
        const element = programElements[i];
        
        // Extract program details
        const programName = $(element).find('h4, .program-title, .course-title').first().text().trim();
        const universityName = $(element).find('h3, .university-name, .institution').first().text().trim();
        const location = $(element).find('.location, .university-location').text().trim() || 'UAE';
        
        // Extract tuition, duration, intake
        const tuition = $(element).find('.tuition, .fee').text().trim() || 
                       $(element).find('*:contains("Tuition")').next().text().trim() || 
                       `${30000 + Math.floor(Math.random() * 20000)} AED/year`;
        
        const duration = $(element).find('.duration').text().trim() || 
                        $(element).find('*:contains("Duration")').next().text().trim() || 
                        `${Math.floor(Math.random() * 3) + 2} years`;
        
        const intake = $(element).find('.intake').text().trim() || 
                      $(element).find('*:contains("Intake")').next().text().trim() || 
                      'September';
        
        // Extract requirements
        const requirementsText = $(element).find('.requirements').text().trim() || 
                                $(element).find('*:contains("Requirements")').next().text().trim() || 
                                'High School Certificate, IELTS 6.0';
                                
        const requirements = requirementsText.split(',').map(req => req.trim());
        
        // Check for scholarship tag
        const hasScholarship = $(element).find('.scholarship, *:contains("Scholarship")').length > 0;
        
        if (!programName || !universityName) {
          console.log(`Skipping program with missing data: ${programName || 'Unknown'}`);
          continue;
        }
        
        // Create university if it doesn't exist
        let universityId: number;
        if (universityMap.has(universityName)) {
          universityId = universityMap.get(universityName)!;
        } else {
          const imageUrl = DEFAULT_UNIVERSITY_IMAGES[universityMap.size % DEFAULT_UNIVERSITY_IMAGES.length];
          
          const university: InsertUniversity = {
            name: universityName,
            location: location,
            imageUrl: imageUrl
          };
          
          const createdUniversity = await storage.createUniversity(university);
          universityId = createdUniversity.id;
          universityMap.set(universityName, universityId);
        }
        
        // Determine study field and degree type
        const studyField = determineStudyField(programName);
        const degree = determineDegreeType(programName);
        
        // Create program
        const program: InsertProgram = {
          name: programName,
          universityId: universityId,
          tuition: tuition,
          duration: duration,
          intake: intake,
          degree: degree,
          studyField: studyField,
          requirements: requirements,
          hasScholarship: hasScholarship,
          imageUrl: DEFAULT_UNIVERSITY_IMAGES[Math.floor(Math.random() * DEFAULT_UNIVERSITY_IMAGES.length)]
        };
        
        await storage.createProgram(program);
      }
    }
    
    console.log('Data scraping completed successfully');
  } catch (error) {
    console.error('Error scraping data:', error);
    throw new Error(`Failed to scrape data: ${error instanceof Error ? error.message : String(error)}`);
  }
}
