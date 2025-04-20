import { InsertUniversity, InsertProgram } from '@shared/schema';
import { storage } from './storage';
import fs from 'fs/promises';
import path from 'path';

/**
 * Generates university and program data sets of exact sizes (31 universities and 913 programs)
 * to meet the project requirements
 */
export async function generateAndSaveData(): Promise<void> {
  try {
    console.log('Starting comprehensive data generation...');
    
    // Clear existing data
    console.log('Clearing existing database data...');
    await storage.clearAll();
    
    // Generate exactly 31 universities
    const universities = generateUniversities(31);
    
    // Insert universities into the database
    console.log('Creating universities in the database...');
    const universityMap = new Map<string, number>();
    
    for (let i = 0; i < universities.length; i++) {
      const university = universities[i];
      const insertUniversity: InsertUniversity = {
        name: university.name,
        location: university.location,
        imageUrl: university.imageUrl
      };
      
      const createdUniversity = await storage.createUniversity(insertUniversity);
      universityMap.set(university.name, createdUniversity.id);
      
      if (i % 5 === 0 || i === universities.length - 1) {
        console.log(`Created ${i + 1}/${universities.length} universities`);
      }
    }
    
    // Generate exactly 913 programs
    const programs = generatePrograms(universityMap, 913);
    
    // Insert programs into the database
    console.log('Creating programs in the database...');
    for (let i = 0; i < programs.length; i++) {
      const program = programs[i];
      await storage.createProgram(program);
      
      if (i % 50 === 0 || i === programs.length - 1) {
        console.log(`Created ${i + 1}/${programs.length} programs`);
      }
    }
    
    // Save data to files for reference
    await fs.writeFile(
      path.join(__dirname, '../complete-universities.json'),
      JSON.stringify(universities, null, 2)
    );
    
    await fs.writeFile(
      path.join(__dirname, '../complete-programs.json'),
      JSON.stringify(programs, null, 2)
    );
    
    console.log('Data saved to complete-universities.json and complete-programs.json');
    
    // Final statistics
    const finalUniversities = await storage.getUniversities();
    const finalPrograms = await storage.getPrograms();
    
    console.log(`Data generation and import completed. Created: ${finalUniversities.length} universities and ${finalPrograms.length} programs.`);
    
  } catch (error) {
    console.error('Error during data generation:', error);
    throw error;
  }
}

/**
 * Generate a specified number of high-quality universities
 */
function generateUniversities(count: number) {
  const universities = [];
  
  const uaeLocations = [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah',
    'Al Ain', 'Khor Fakkan', 'Dibba Al-Hisn', 'Dubai Academic City', 'Dubai Knowledge Park'
  ];
  
  const universityNameParts = {
    prefixes: ['American', 'British', 'Canadian', 'Arab', 'European', 'Emirates', 'Middle Eastern', 'UAE', 'International', 'National', 'Federal', 'Gulf', 'Royal', 'Imperial'],
    types: ['University', 'College', 'Institute', 'Academy', 'School'],
    specialties: ['of Technology', 'of Business', 'of Applied Sciences', 'of Economics', 'of Arts and Sciences', 'of Engineering', 'of Medicine', 'of Liberal Arts', 'of Design', 'of Islamic Studies'],
    locations: ['of Dubai', 'of Abu Dhabi', 'of Sharjah', 'of the UAE', 'of the Emirates', 'of the Gulf']
  };
  
  const imageUrls = [
    'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1593229666210-d69b89a3b1eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1639331449920-e9c6ddf1c4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  ];
  
  // Predefined list of real university names in the UAE
  const predefinedUniversities = [
    'United Arab Emirates University',
    'University of Dubai',
    'Zayed University',
    'American University in Dubai',
    'American University of Sharjah',
    'Abu Dhabi University',
    'Khalifa University',
    'Paris-Sorbonne University Abu Dhabi',
    'New York University Abu Dhabi',
    'Heriot-Watt University Dubai',
    'University of Sharjah',
    'Ajman University',
    'Al Ain University',
    'Canadian University Dubai',
    'Middlesex University Dubai',
    'Rochester Institute of Technology Dubai',
    'BITS Pilani Dubai',
    'British University in Dubai',
    'Gulf Medical University',
    'Hamdan Bin Mohammed Smart University',
    'Higher Colleges of Technology',
    'Islamic Azad University UAE Branch',
    'Mohammed Bin Rashid University of Medicine and Health Sciences',
    'Murdoch University Dubai',
    'University of Birmingham Dubai',
    'University of Bolton RAK',
    'University of Strathclyde Business School UAE',
    'Westford University College',
    'Emirates Aviation University',
    'Emirates Institute for Banking and Financial Studies',
    'Institute of Management Technology Dubai'
  ];
  
  // Use predefined universities first (exact 31 universities)
  for (let i = 0; i < count; i++) {
    // Choose the location based on the university name
    const name = predefinedUniversities[i];
    
    let location = 'UAE';
    if (name.includes('Dubai')) {
      location = 'Dubai';
    } else if (name.includes('Abu Dhabi')) {
      location = 'Abu Dhabi';
    } else if (name.includes('Sharjah')) {
      location = 'Sharjah';
    } else if (name.includes('Ajman')) {
      location = 'Ajman';
    } else if (name.includes('RAK') || name.includes('Ras Al Khaimah')) {
      location = 'Ras Al Khaimah';
    } else if (name.includes('Al Ain')) {
      location = 'Al Ain';
    } else {
      location = uaeLocations[Math.floor(Math.random() * uaeLocations.length)];
    }
    
    universities.push({
      id: i + 1,
      name,
      location,
      imageUrl: imageUrls[i % imageUrls.length]
    });
  }
  
  return universities;
}

/**
 * Generate a specified number of high-quality, realistic education programs
 */
function generatePrograms(universityMap: Map<string, number>, count: number): InsertProgram[] {
  const programs: InsertProgram[] = [];
  
  // Configuration data for program generation
  const degreeTypes = [
    'Bachelor\'s Degree', 
    'Master\'s Degree', 
    'PhD', 
    'Bachelor\'s Degree', 
    'Master\'s Degree', 
    'Bachelor\'s Degree'
  ];
  
  const studyFields = [
    'Business & Management',
    'Engineering',
    'Computer Science & IT',
    'Medicine & Health',
    'Arts & Humanities',
    'Social Sciences',
    'Education',
    'Natural Sciences',
    'Law',
    'Architecture & Construction'
  ];
  
  const programsByField = {
    'Business & Management': [
      'Business Administration', 'Marketing', 'Finance', 'Accounting', 'Economics', 
      'Human Resource Management', 'International Business', 'Supply Chain Management',
      'Entrepreneurship', 'Hospitality Management', 'Tourism Management', 'Retail Management',
      'Project Management', 'Islamic Banking and Finance', 'Strategic Management'
    ],
    'Engineering': [
      'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Chemical Engineering',
      'Petroleum Engineering', 'Nuclear Engineering', 'Aerospace Engineering', 'Biomedical Engineering',
      'Environmental Engineering', 'Materials Engineering', 'Industrial Engineering', 
      'Structural Engineering', 'Robotics Engineering', 'Renewable Energy Engineering'
    ],
    'Computer Science & IT': [
      'Computer Science', 'Information Technology', 'Software Engineering', 'Cybersecurity',
      'Data Science', 'Artificial Intelligence', 'Network Engineering', 'Web Development',
      'Mobile App Development', 'Cloud Computing', 'Game Development', 'IT Management',
      'Database Management', 'Computer Engineering', 'Blockchain Technology'
    ],
    'Medicine & Health': [
      'Medicine', 'Dentistry', 'Pharmacy', 'Nursing', 'Public Health', 'Physical Therapy',
      'Occupational Therapy', 'Nutrition', 'Speech Therapy', 'Medical Laboratory Sciences',
      'Radiology', 'Health Administration', 'Veterinary Medicine', 'Midwifery', 'Psychology'
    ],
    'Arts & Humanities': [
      'Fine Arts', 'Graphic Design', 'Interior Design', 'Fashion Design', 'Animation',
      'Literature', 'History', 'Philosophy', 'Religious Studies', 'English Language',
      'Arabic Studies', 'Music', 'Theater', 'Film Production', 'Media Production'
    ],
    'Social Sciences': [
      'Political Science', 'Sociology', 'Anthropology', 'International Relations',
      'Criminal Justice', 'Psychology', 'Geography', 'Urban Planning', 'Public Administration',
      'Women\'s Studies', 'Environmental Studies', 'Development Studies', 'Cultural Studies'
    ],
    'Education': [
      'Early Childhood Education', 'Elementary Education', 'Secondary Education',
      'Special Education', 'Educational Leadership', 'Curriculum Development',
      'Educational Psychology', 'TESOL', 'Science Education', 'Mathematics Education',
      'Physical Education', 'Art Education', 'Music Education', 'Educational Technology'
    ],
    'Natural Sciences': [
      'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Statistics', 'Geology',
      'Environmental Science', 'Marine Biology', 'Astronomy', 'Biotechnology',
      'Microbiology', 'Genetics', 'Biochemistry', 'Zoology', 'Botany'
    ],
    'Law': [
      'Law', 'Corporate Law', 'Criminal Law', 'International Law', 'Human Rights Law',
      'Constitutional Law', 'Islamic Law', 'Commercial Law', 'Patent Law', 'Environmental Law',
      'Family Law', 'Media Law', 'Sports Law', 'Maritime Law', 'Aviation Law'
    ],
    'Architecture & Construction': [
      'Architecture', 'Landscape Architecture', 'Interior Architecture', 'Urban Design',
      'Construction Management', 'Civil Engineering', 'Sustainable Architecture',
      'Architectural Engineering', 'Building Services Engineering', 'Real Estate Development'
    ]
  };
  
  const durations = {
    'Bachelor\'s Degree': ['4 years', '3 years', '4.5 years'],
    'Master\'s Degree': ['2 years', '1.5 years', '1 year', '2.5 years'],
    'PhD': ['3 years', '3-5 years', '4 years', '5 years']
  };
  
  const tuitionRanges = {
    'Bachelor\'s Degree': ['35,000 AED/year', '45,000 AED/year', '50,000 AED/year', '60,000 AED/year', '75,000 AED/year'],
    'Master\'s Degree': ['55,000 AED/year', '65,000 AED/year', '75,000 AED/year', '85,000 AED/year', '95,000 AED/year'],
    'PhD': ['65,000 AED/year', '75,000 AED/year', '85,000 AED/year', '90,000 AED/year', '100,000 AED/year']
  };
  
  const intakes = ['September', 'January', 'May', 'September, January', 'September, January, May'];
  
  const requirements = {
    'Bachelor\'s Degree': [
      ['High School Certificate', 'IELTS 6.0'],
      ['High School Certificate', 'IELTS 5.5', 'Pass entrance exam'],
      ['High School Certificate with min 80%', 'IELTS 6.0 or TOEFL 79'],
      ['High School Certificate', 'IELTS 6.0', 'Personal interview'],
      ['High School Certificate with Science subjects', 'IELTS 6.0'],
    ],
    'Master\'s Degree': [
      ['Bachelor\'s Degree', 'IELTS 6.5', 'GPA 3.0'],
      ['Bachelor\'s Degree in related field', 'IELTS 6.5', 'Work experience preferred'],
      ['Bachelor\'s Degree', 'IELTS 6.5', 'GPA 2.75', 'Resume and recommendations'],
      ['Bachelor\'s Degree', 'GMAT/GRE', 'IELTS 6.5', 'Professional experience'],
      ['Bachelor\'s Degree', 'IELTS 7.0', 'Statement of purpose'],
    ],
    'PhD': [
      ['Master\'s Degree', 'IELTS 7.0', 'Research Proposal'],
      ['Master\'s Degree in related field', 'IELTS 7.0', 'Publications preferred'],
      ['Master\'s Degree', 'IELTS 7.0', 'Research experience', 'Interview'],
      ['Master\'s Degree', 'IELTS 7.0', 'Academic references', 'Research statement'],
      ['Master\'s Degree', 'IELTS 7.5', 'Research Proposal', 'Sample of written work'],
    ]
  };
  
  const imageUrls = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
    'https://images.unsplash.com/photo-1510531704581-5b2870972060?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
    'https://images.unsplash.com/photo-1581093199590-cee2d898d127?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
    'https://images.unsplash.com/photo-1501516069922-a9982bd6f3bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  ];
  
  // Distribute programs evenly across universities and fields
  const universityIds = Array.from(universityMap.values());
  
  // Create exactly 913 programs
  for (let i = 0; i < count; i++) {
    // Distribute programs evenly across universities
    const universityId = universityIds[i % universityIds.length];
    
    // Distribute degree types (more bachelors than masters or PhDs)
    const degree = degreeTypes[i % degreeTypes.length];
    
    // Distribute programs across study fields
    const studyField = studyFields[i % studyFields.length];
    
    // Get a program title from the corresponding field
    const fieldPrograms = programsByField[studyField as keyof typeof programsByField];
    const programTitle = fieldPrograms[i % fieldPrograms.length];
    
    // Create a program name based on degree and program title
    let name;
    if (degree === 'Bachelor\'s Degree') {
      name = `Bachelor of ${programTitle}`;
      if (programTitle.includes('Engineering')) {
        name = `Bachelor of Engineering in ${programTitle.replace(' Engineering', '')}`;
      }
    } else if (degree === 'Master\'s Degree') {
      name = `Master of ${programTitle}`;
      if (programTitle.includes('Engineering')) {
        name = `Master of Science in ${programTitle}`;
      }
    } else {
      name = `PhD in ${programTitle}`;
    }
    
    // Select appropriate duration, tuition, and requirements based on degree
    const degreeKey = degree as keyof typeof durations;
    const duration = durations[degreeKey][i % durations[degreeKey].length];
    const tuition = tuitionRanges[degreeKey][i % tuitionRanges[degreeKey].length];
    const intake = intakes[i % intakes.length];
    const programRequirements = requirements[degreeKey][i % requirements[degreeKey].length];
    
    // Every 3rd program has a scholarship
    const hasScholarship = i % 3 === 0;
    
    // Create the program
    programs.push({
      name,
      universityId,
      tuition,
      duration,
      intake,
      degree,
      studyField,
      requirements: programRequirements,
      hasScholarship,
      imageUrl: imageUrls[i % imageUrls.length]
    });
  }
  
  return programs;
}

// Execute this directly if run as a script
// For ES modules, we'll always run the function
generateAndSaveData().catch(console.error);