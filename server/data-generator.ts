import { InsertProgram, InsertUniversity } from '@shared/schema';

// Real UAE university names
const UAE_UNIVERSITIES = [
  { name: 'University of Sharjah', location: 'Sharjah, UAE' },
  { name: 'Zayed University', location: 'Abu Dhabi & Dubai, UAE' },
  { name: 'United Arab Emirates University', location: 'Al Ain, UAE' },
  { name: 'American University of Sharjah', location: 'Sharjah, UAE' },
  { name: 'American University in Dubai', location: 'Dubai, UAE' },
  { name: 'Abu Dhabi University', location: 'Abu Dhabi, UAE' },
  { name: 'Khalifa University', location: 'Abu Dhabi, UAE' },
  { name: 'Ajman University', location: 'Ajman, UAE' },
  { name: 'Al Ain University', location: 'Al Ain, UAE' },
  { name: 'Canadian University Dubai', location: 'Dubai, UAE' },
  { name: 'University of Dubai', location: 'Dubai, UAE' },
  { name: 'Higher Colleges of Technology', location: 'Multiple, UAE' },
  { name: 'Middlesex University Dubai', location: 'Dubai, UAE' },
  { name: 'Heriot-Watt University Dubai', location: 'Dubai, UAE' },
  { name: 'NYU Abu Dhabi', location: 'Abu Dhabi, UAE' },
  { name: 'Paris-Sorbonne University Abu Dhabi', location: 'Abu Dhabi, UAE' },
  { name: 'Rochester Institute of Technology Dubai', location: 'Dubai, UAE' },
  { name: 'Gulf Medical University', location: 'Ajman, UAE' },
  { name: 'British University in Dubai', location: 'Dubai, UAE' },
  { name: 'Manipal Academy of Higher Education Dubai', location: 'Dubai, UAE' },
  { name: 'SP Jain School of Global Management', location: 'Dubai, UAE' },
  { name: 'Amity University Dubai', location: 'Dubai, UAE' },
  { name: 'Emirates Aviation University', location: 'Dubai, UAE' },
  { name: 'University of Modern Sciences', location: 'Dubai, UAE' },
  { name: 'Westford University College', location: 'Sharjah, UAE' },
  { name: 'University of Birmingham Dubai', location: 'Dubai, UAE' },
  { name: 'BITS Pilani Dubai Campus', location: 'Dubai, UAE' },
  { name: 'Murdoch University Dubai', location: 'Dubai, UAE' },
  { name: 'Synergy University Dubai', location: 'Dubai, UAE' },
  { name: 'Skyline University College', location: 'Sharjah, UAE' },
  { name: 'Curtin University Dubai', location: 'Dubai, UAE' }
];

// Default university images
const DEFAULT_UNIVERSITY_IMAGES = [
  'https://images.unsplash.com/photo-1612268363012-bb75afd00ae5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
  'https://images.unsplash.com/photo-1554475901-6cadab2e424e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
];

// Program data building blocks
const DEGREE_LEVELS = [
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD',
  'Diploma'
];

const STUDY_FIELDS = [
  'Business & Management',
  'Engineering',
  'Computer Science & IT',
  'Medicine & Health',
  'Arts & Humanities'
];

// Tuition ranges per degree type (in AED)
const TUITION_RANGES = {
  'Bachelor\'s Degree': { min: 30000, max: 70000 },
  'Master\'s Degree': { min: 50000, max: 90000 },
  'PhD': { min: 70000, max: 120000 },
  'Diploma': { min: 20000, max: 40000 }
};

// Duration ranges per degree type (in years)
const DURATION_RANGES = {
  'Bachelor\'s Degree': { min: 3, max: 4 },
  'Master\'s Degree': { min: 1, max: 2 },
  'PhD': { min: 3, max: 5 },
  'Diploma': { min: 1, max: 2 }
};

// Intake options
const INTAKE_OPTIONS = [
  'September',
  'January',
  'September/January',
  'Fall/Spring',
  'Fall'
];

// Requirements by degree level
const REQUIREMENTS_BY_DEGREE = {
  'Bachelor\'s Degree': [
    ['High School Certificate', 'IELTS 6.0'],
    ['High School Certificate', 'IELTS 5.5', 'Entrance Exam'],
    ['High School Certificate', 'TOEFL 80', 'Statement of Purpose']
  ],
  'Master\'s Degree': [
    ['Bachelor Degree', 'IELTS 6.5', 'Work Experience'],
    ['Bachelor Degree', 'GMAT', 'CV/Resume'],
    ['Bachelor Degree', 'IELTS 6.5', 'Research Proposal']
  ],
  'PhD': [
    ['Master Degree', 'IELTS 7.0', 'Research Proposal'],
    ['Master Degree', 'IELTS 6.5', 'Publications', 'Research Experience'],
    ['Master Degree', 'Academic References', 'Research Plan']
  ],
  'Diploma': [
    ['High School Certificate', 'IELTS 5.5'],
    ['High School Certificate', 'TOEFL 70'],
    ['High School Certificate', 'English Proficiency']
  ]
};

// Sample program names by field and degree
const PROGRAM_NAMES = {
  'Business & Management': {
    'Bachelor\'s Degree': [
      'Bachelor of Business Administration',
      'Bachelor of Commerce',
      'Bachelor of Accounting and Finance',
      'Bachelor of International Business',
      'Bachelor of Marketing',
      'Bachelor of Human Resource Management',
      'Bachelor of Supply Chain Management',
      'Bachelor of Entrepreneurship',
      'Bachelor of Finance',
      'Bachelor of Economics'
    ],
    'Master\'s Degree': [
      'Master of Business Administration (MBA)',
      'Master of Finance',
      'Master of Marketing',
      'Master of International Business',
      'Master of Human Resource Management',
      'Master of Project Management',
      'Master of Supply Chain Management',
      'Master of Accounting',
      'Master of Economics',
      'Master of Business Analytics'
    ],
    'PhD': [
      'PhD in Business Administration',
      'PhD in Finance',
      'PhD in Economics',
      'PhD in Management',
      'PhD in Marketing',
      'PhD in Accounting',
      'PhD in Business Analytics',
      'Doctor of Business Administration (DBA)'
    ],
    'Diploma': [
      'Diploma in Business Administration',
      'Diploma in Marketing',
      'Diploma in Finance',
      'Diploma in Accounting',
      'Professional Diploma in Management'
    ]
  },
  'Engineering': {
    'Bachelor\'s Degree': [
      'Bachelor of Civil Engineering',
      'Bachelor of Mechanical Engineering',
      'Bachelor of Electrical Engineering',
      'Bachelor of Chemical Engineering',
      'Bachelor of Aerospace Engineering',
      'Bachelor of Petroleum Engineering',
      'Bachelor of Environmental Engineering',
      'Bachelor of Industrial Engineering',
      'Bachelor of Biomedical Engineering',
      'Bachelor of Architectural Engineering'
    ],
    'Master\'s Degree': [
      'Master of Civil Engineering',
      'Master of Mechanical Engineering',
      'Master of Electrical Engineering',
      'Master of Chemical Engineering',
      'Master of Aerospace Engineering',
      'Master of Petroleum Engineering',
      'Master of Environmental Engineering',
      'Master of Industrial Engineering',
      'Master of Biomedical Engineering',
      'Master of Architectural Engineering'
    ],
    'PhD': [
      'PhD in Civil Engineering',
      'PhD in Mechanical Engineering',
      'PhD in Electrical Engineering',
      'PhD in Chemical Engineering',
      'PhD in Aerospace Engineering',
      'PhD in Petroleum Engineering',
      'PhD in Environmental Engineering',
      'PhD in Industrial Engineering'
    ],
    'Diploma': [
      'Diploma in Civil Engineering',
      'Diploma in Mechanical Engineering',
      'Diploma in Electrical Engineering',
      'Diploma in Engineering Management'
    ]
  },
  'Computer Science & IT': {
    'Bachelor\'s Degree': [
      'Bachelor of Computer Science',
      'Bachelor of Information Technology',
      'Bachelor of Software Engineering',
      'Bachelor of Cybersecurity',
      'Bachelor of Data Science',
      'Bachelor of Artificial Intelligence',
      'Bachelor of Network Engineering',
      'Bachelor of Game Development',
      'Bachelor of Web Development',
      'Bachelor of Mobile Application Development'
    ],
    'Master\'s Degree': [
      'Master of Computer Science',
      'Master of Information Technology',
      'Master of Software Engineering',
      'Master of Cybersecurity',
      'Master of Data Science',
      'Master of Artificial Intelligence',
      'Master of Network Engineering',
      'Master of IT Management',
      'Master of Cloud Computing',
      'Master of Information Systems'
    ],
    'PhD': [
      'PhD in Computer Science',
      'PhD in Information Technology',
      'PhD in Software Engineering',
      'PhD in Cybersecurity',
      'PhD in Data Science',
      'PhD in Artificial Intelligence',
      'PhD in Computer Engineering'
    ],
    'Diploma': [
      'Diploma in Information Technology',
      'Diploma in Computer Science',
      'Diploma in Programming',
      'Diploma in Web Development',
      'Diploma in Network Administration'
    ]
  },
  'Medicine & Health': {
    'Bachelor\'s Degree': [
      'Bachelor of Medicine and Bachelor of Surgery (MBBS)',
      'Bachelor of Dental Surgery',
      'Bachelor of Pharmacy',
      'Bachelor of Nursing',
      'Bachelor of Physiotherapy',
      'Bachelor of Medical Laboratory Sciences',
      'Bachelor of Nutrition and Dietetics',
      'Bachelor of Radiography',
      'Bachelor of Public Health',
      'Bachelor of Health Sciences'
    ],
    'Master\'s Degree': [
      'Master of Public Health',
      'Master of Health Administration',
      'Master of Nursing',
      'Master of Pharmacy',
      'Master of Physiotherapy',
      'Master of Medical Sciences',
      'Master of Healthcare Management',
      'Master of Clinical Psychology',
      'Master of Epidemiology',
      'Master of Health Informatics'
    ],
    'PhD': [
      'PhD in Medical Sciences',
      'PhD in Pharmacy',
      'PhD in Public Health',
      'PhD in Nursing',
      'PhD in Healthcare Management',
      'PhD in Clinical Psychology',
      'PhD in Biomedical Sciences'
    ],
    'Diploma': [
      'Diploma in Nursing',
      'Diploma in Healthcare Management',
      'Diploma in Medical Laboratory Technology',
      'Diploma in Pharmacy Assistant',
      'Diploma in First Aid and Emergency Care'
    ]
  },
  'Arts & Humanities': {
    'Bachelor\'s Degree': [
      'Bachelor of Arts in English Literature',
      'Bachelor of Fine Arts',
      'Bachelor of Architecture',
      'Bachelor of Design',
      'Bachelor of Communication',
      'Bachelor of Journalism',
      'Bachelor of Education',
      'Bachelor of Psychology',
      'Bachelor of International Relations',
      'Bachelor of Media Studies'
    ],
    'Master\'s Degree': [
      'Master of Arts in English Literature',
      'Master of Fine Arts',
      'Master of Architecture',
      'Master of Design',
      'Master of Communication',
      'Master of Journalism',
      'Master of Education',
      'Master of Psychology',
      'Master of International Relations',
      'Master of Media Studies'
    ],
    'PhD': [
      'PhD in Literature',
      'PhD in Education',
      'PhD in Psychology',
      'PhD in Architecture',
      'PhD in Media Studies',
      'PhD in History',
      'PhD in Philosophy',
      'PhD in Sociology'
    ],
    'Diploma': [
      'Diploma in Graphic Design',
      'Diploma in Interior Design',
      'Diploma in Creative Writing',
      'Diploma in Media Production',
      'Diploma in Teaching'
    ]
  }
};

// Function to generate a university with real data
export function generateUniversity(index: number): InsertUniversity {
  const universityData = UAE_UNIVERSITIES[index % UAE_UNIVERSITIES.length];
  
  return {
    name: universityData.name,
    location: universityData.location,
    imageUrl: DEFAULT_UNIVERSITY_IMAGES[index % DEFAULT_UNIVERSITY_IMAGES.length]
  };
}

// Function to generate a program with realistic data
export function generateProgram(universityId: number, index: number): InsertProgram {
  // Determine degree level based on distribution (60% Bachelor's, 30% Master's, 8% PhD, 2% Diploma)
  let degreeLevel: string;
  const rand = Math.random() * 100;
  if (rand < 60) {
    degreeLevel = DEGREE_LEVELS[0]; // Bachelor's
  } else if (rand < 90) {
    degreeLevel = DEGREE_LEVELS[1]; // Master's
  } else if (rand < 98) {
    degreeLevel = DEGREE_LEVELS[2]; // PhD
  } else {
    degreeLevel = DEGREE_LEVELS[3]; // Diploma
  }
  
  // Select a study field
  const studyField = STUDY_FIELDS[index % STUDY_FIELDS.length];
  
  // Get program names for this field and degree
  const availableNames = PROGRAM_NAMES[studyField][degreeLevel];
  const programName = availableNames[index % availableNames.length];
  
  // Generate tuition fee
  const tuitionRange = TUITION_RANGES[degreeLevel];
  const tuition = `${Math.floor(Math.random() * (tuitionRange.max - tuitionRange.min + 1) + tuitionRange.min).toLocaleString()} AED/year`;
  
  // Generate duration
  const durationRange = DURATION_RANGES[degreeLevel];
  const durationYears = Math.floor(Math.random() * (durationRange.max - durationRange.min + 1) + durationRange.min);
  const duration = `${durationYears} ${durationYears === 1 ? 'year' : 'years'}`;
  
  // Select intake
  const intake = INTAKE_OPTIONS[index % INTAKE_OPTIONS.length];
  
  // Select requirements based on degree level
  const requirementOptions = REQUIREMENTS_BY_DEGREE[degreeLevel];
  const requirements = requirementOptions[index % requirementOptions.length];
  
  // Determine if program has scholarship (30% chance)
  const hasScholarship = Math.random() < 0.3;
  
  // Select an image
  const imageUrl = DEFAULT_UNIVERSITY_IMAGES[index % DEFAULT_UNIVERSITY_IMAGES.length];
  
  return {
    name: programName,
    universityId,
    tuition,
    duration,
    intake,
    degree: degreeLevel,
    studyField,
    requirements,
    hasScholarship,
    imageUrl
  };
}

// Generates exactly 31 universities and 913 programs
export async function generateFullDataset() {
  // Generate 31 universities
  const universities: InsertUniversity[] = [];
  for (let i = 0; i < 31; i++) {
    universities.push(generateUniversity(i));
  }
  
  // Generate 913 programs, distributed among universities
  const programs: { program: InsertProgram, universityIndex: number }[] = [];
  const programsPerUniversity = Math.floor(913 / 31); // Base programs per university
  const extraPrograms = 913 % 31; // Remainder to distribute
  
  let programIndex = 0;
  for (let i = 0; i < 31; i++) {
    // Calculate how many programs this university should have
    let uniProgramCount = programsPerUniversity + (i < extraPrograms ? 1 : 0);
    
    // Generate programs for this university
    for (let j = 0; j < uniProgramCount; j++) {
      programs.push({
        program: generateProgram(i + 1, programIndex), // University IDs will start from 1
        universityIndex: i
      });
      programIndex++;
    }
  }
  
  return { universities, programs };
}