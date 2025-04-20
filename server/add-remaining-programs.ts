import { InsertProgram } from '@shared/schema';
import { storage } from './storage';

async function addRemainingPrograms() {
  try {
    // Get all university IDs
    const universities = await storage.getUniversities();
    if (universities.length === 0) {
      throw new Error('No universities found in the database');
    }
    
    console.log(`Found ${universities.length} universities to distribute programs across`);
    
    // Get current program count
    const existingPrograms = await storage.getPrograms();
    const currentCount = existingPrograms.length;
    const targetCount = 913;
    const remainingToAdd = targetCount - currentCount;
    
    if (remainingToAdd <= 0) {
      console.log('Target count already reached. No need to add more programs.');
      return;
    }
    
    console.log(`Adding ${remainingToAdd} more programs to reach target of ${targetCount}`);
    
    // Define program generation data
    const degreeTypes = [
      'Bachelor\'s Degree', 
      'Master\'s Degree', 
      'PhD'
    ];
    
    const studyFields = [
      'Business & Management',
      'Engineering',
      'Computer Science & IT',
      'Medicine & Health',
      'Arts & Humanities'
    ];
    
    const programTemplates: Record<string, string[]> = {
      'Business & Management': ['Business Administration', 'Marketing', 'Finance', 'Accounting'],
      'Engineering': ['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Chemical Engineering'],
      'Computer Science & IT': ['Computer Science', 'Information Technology', 'Cybersecurity', 'Data Science'],
      'Medicine & Health': ['Medicine', 'Nursing', 'Pharmacy', 'Public Health'],
      'Arts & Humanities': ['Fine Arts', 'Design', 'Literature', 'Media Production']
    };
    
    const durations: Record<string, string[]> = {
      'Bachelor\'s Degree': ['4 years', '3 years'],
      'Master\'s Degree': ['2 years', '1.5 years'],
      'PhD': ['3-5 years', '4 years']
    };
    
    const tuitionRanges: Record<string, string[]> = {
      'Bachelor\'s Degree': ['45,000 AED/year', '50,000 AED/year'],
      'Master\'s Degree': ['65,000 AED/year', '75,000 AED/year'],
      'PhD': ['85,000 AED/year', '95,000 AED/year']
    };
    
    const intakes = ['September', 'January, September', 'September, January, May'];
    
    const requirements: Record<string, string[][]> = {
      'Bachelor\'s Degree': [
        ['High School Certificate', 'IELTS 6.0'],
        ['High School Certificate', 'IELTS 5.5', 'Pass entrance exam']
      ],
      'Master\'s Degree': [
        ['Bachelor\'s Degree', 'IELTS 6.5', 'GPA 3.0'],
        ['Bachelor\'s Degree in related field', 'IELTS 6.5', 'Work experience preferred']
      ],
      'PhD': [
        ['Master\'s Degree', 'IELTS 7.0', 'Research Proposal'],
        ['Master\'s Degree in related field', 'IELTS 7.0', 'Publications preferred']
      ]
    };
    
    const imageUrls = [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300&q=80'
    ];
    
    // Generate and insert the remaining programs
    for (let i = 0; i < remainingToAdd; i++) {
      // Get a university ID
      const universityId = universities[i % universities.length].id;
      
      // Select program properties
      const degree = degreeTypes[i % degreeTypes.length];
      const studyField = studyFields[i % studyFields.length];
      
      // Get name components
      const programBase = programTemplates[studyField][i % programTemplates[studyField].length];
      
      // Create program name
      let name;
      if (degree === 'Bachelor\'s Degree') {
        name = `Bachelor of ${programBase}`;
      } else if (degree === 'Master\'s Degree') {
        name = `Master of ${programBase}`;
      } else {
        name = `PhD in ${programBase}`;
      }
      
      // To ensure unique names for similar programs
      name = `${name} (Extended ${i + 1})`;
      
      // Get other properties
      const dKey = degree as keyof typeof durations;
      const duration = durations[dKey][i % durations[dKey].length];
      const tuition = tuitionRanges[dKey][i % tuitionRanges[dKey].length];
      const intake = intakes[i % intakes.length];
      const programRequirements = requirements[dKey][i % requirements[dKey].length];
      const hasScholarship = i % 3 === 0;
      const imageUrl = imageUrls[i % imageUrls.length];
      
      // Create the program object
      const insertProgram: InsertProgram = {
        name,
        universityId,
        tuition,
        duration,
        intake,
        degree,
        studyField,
        requirements: programRequirements,
        hasScholarship,
        imageUrl
      };
      
      // Insert into database
      await storage.createProgram(insertProgram);
      
      if (i % 10 === 0 || i === remainingToAdd - 1) {
        console.log(`Added ${i + 1}/${remainingToAdd} programs`);
      }
    }
    
    // Verify final count
    const finalPrograms = await storage.getPrograms();
    console.log(`Final program count: ${finalPrograms.length}`);
    
  } catch (error) {
    console.error('Error adding remaining programs:', error);
    throw error;
  }
}

// Run the function
addRemainingPrograms().catch(console.error);