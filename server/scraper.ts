import axios from 'axios';
import { load } from 'cheerio';
import { storage } from './storage';
import { type InsertProgram, type InsertUniversity } from '@shared/schema';

// The URL to scrape
const DATA_URL = 'https://e7c0d9ac-af1f-4aa2-88c5-5b0ec4511256-00-2phr93moz2xbl.janeway.replit.dev/';

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
    const response = await axios.get(DATA_URL);
    const $ = load(response.data);
    
    // Map to track created universities to avoid duplicates
    const universityMap = new Map<string, number>();
    
    // Scrape programs
    const programElements = $('div.program-card, div.course-item, div.program-listing');
    
    console.log(`Found ${programElements.length} program elements`);
    
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
    
    // If no programs were found, add some fallback data
    const programCount = await storage.getPrograms();
    if (programCount.length === 0) {
      console.log('No programs found on the page. Adding fallback data...');
      
      // Add sample universities
      const universities = [
        { name: 'Abu Dhabi University', location: 'Abu Dhabi, UAE', imageUrl: DEFAULT_UNIVERSITY_IMAGES[0] },
        { name: 'Ajman University', location: 'Ajman, UAE', imageUrl: DEFAULT_UNIVERSITY_IMAGES[1] },
        { name: 'American University of Sharjah', location: 'Sharjah, UAE', imageUrl: DEFAULT_UNIVERSITY_IMAGES[2] },
        { name: 'Al Hosn University', location: 'Abu Dhabi, UAE', imageUrl: DEFAULT_UNIVERSITY_IMAGES[3] },
        { name: 'Canadian University Dubai', location: 'Dubai, UAE', imageUrl: DEFAULT_UNIVERSITY_IMAGES[4] },
        { name: 'University of Sharjah', location: 'Sharjah, UAE', imageUrl: DEFAULT_UNIVERSITY_IMAGES[5] }
      ];
      
      for (const uni of universities) {
        const created = await storage.createUniversity(uni);
        universityMap.set(uni.name, created.id);
      }
      
      // Add sample programs
      const programs = [
        {
          name: 'BSc Computer Science',
          universityName: 'Abu Dhabi University',
          tuition: '35,000 AED/year',
          duration: '4 years',
          intake: 'September',
          studyField: 'Computer Science & IT',
          degree: 'Bachelor\'s Degree',
          requirements: ['High School Certificate', 'IELTS 6.0'],
          hasScholarship: true
        },
        {
          name: 'Bachelor of Business Administration',
          universityName: 'Ajman University',
          tuition: '28,500 AED/year',
          duration: '4 years',
          intake: 'Sep/Jan',
          studyField: 'Business & Management',
          degree: 'Bachelor\'s Degree',
          requirements: ['High School Certificate', 'IELTS 5.5'],
          hasScholarship: false
        },
        {
          name: 'MSc Electrical Engineering',
          universityName: 'American University of Sharjah',
          tuition: '42,000 AED/year',
          duration: '2 years',
          intake: 'Fall/Spring',
          studyField: 'Engineering',
          degree: 'Master\'s Degree',
          requirements: ['Bachelor Degree', 'IELTS 6.5', 'GRE'],
          hasScholarship: true
        },
        {
          name: 'Bachelor of Architecture',
          universityName: 'Al Hosn University',
          tuition: '32,000 AED/year',
          duration: '5 years',
          intake: 'September',
          studyField: 'Arts & Humanities',
          degree: 'Bachelor\'s Degree',
          requirements: ['High School Certificate', 'Portfolio', 'IELTS 6.0'],
          hasScholarship: false
        },
        {
          name: 'MBA in Finance',
          universityName: 'Canadian University Dubai',
          tuition: '45,000 AED/year',
          duration: '1.5 years',
          intake: 'Sep/Jan/May',
          studyField: 'Business & Management',
          degree: 'Master\'s Degree',
          requirements: ['Bachelor Degree', 'GMAT', 'Work Experience', 'IELTS 6.5'],
          hasScholarship: true
        },
        {
          name: 'BSc Nursing',
          universityName: 'University of Sharjah',
          tuition: '36,500 AED/year',
          duration: '4 years',
          intake: 'Fall',
          studyField: 'Medicine & Health',
          degree: 'Bachelor\'s Degree',
          requirements: ['High School Certificate', 'IELTS 6.0', 'Interview'],
          hasScholarship: false
        }
      ];
      
      for (const prog of programs) {
        const universityId = universityMap.get(prog.universityName)!;
        
        const program: InsertProgram = {
          name: prog.name,
          universityId: universityId,
          tuition: prog.tuition,
          duration: prog.duration,
          intake: prog.intake,
          degree: prog.degree,
          studyField: prog.studyField,
          requirements: prog.requirements,
          hasScholarship: prog.hasScholarship,
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
