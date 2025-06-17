/**
 * Script to create a test Excel file and test the upload functionality
 */
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create sample data
const universitiesData = [
  {
    name: "Test University 1",
    location: "Dubai, UAE",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Test University 2", 
    location: "Abu Dhabi, UAE",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  }
];

const programsData = [
  {
    name: "Computer Science",
    universityName: "Test University 1",
    tuition: "50000 AED/year",
    duration: "4 years",
    intake: "September",
    degree: "Bachelor's Degree",
    studyField: "Technology",
    requirements: "High School Diploma, IELTS 6.0",
    hasScholarship: true,
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Business Administration",
    universityName: "Test University 2",
    tuition: "45000 AED/year", 
    duration: "3 years",
    intake: "January",
    degree: "Bachelor's Degree",
    studyField: "Business",
    requirements: "High School Diploma, IELTS 6.5",
    hasScholarship: false,
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  }
];

// Create workbook
const workbook = XLSX.utils.book_new();

// Create Universities sheet
const universitiesSheet = XLSX.utils.json_to_sheet(universitiesData);
XLSX.utils.book_append_sheet(workbook, universitiesSheet, "Universities");

// Create Programs sheet  
const programsSheet = XLSX.utils.json_to_sheet(programsData);
XLSX.utils.book_append_sheet(workbook, programsSheet, "Programs");

// Write to file
const filePath = path.join(__dirname, 'test-universities-programs.xlsx');
XLSX.writeFile(workbook, filePath);

console.log('Test Excel file created:', filePath);
console.log('Sheet names:', workbook.SheetNames);
console.log('Universities data:', universitiesData.length, 'rows');
console.log('Programs data:', programsData.length, 'rows');