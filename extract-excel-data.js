import XLSX from 'xlsx';
import fs from 'fs';

try {
  // Read the Excel file
  const workbook = XLSX.readFile('./attached_assets/Cleaned_University_Courses_1750161637756.xlsx');
  
  console.log('Available sheets:', workbook.SheetNames);
  
  // Process each sheet
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n=== Processing ${sheetName} ===`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} rows`);
    if (data.length > 0) {
      console.log('Headers:', Object.keys(data[0]));
      console.log('First 3 rows:', data.slice(0, 3));
    }
    
    // Save data to JSON file for inspection
    fs.writeFileSync(`extracted-${sheetName.toLowerCase()}.json`, JSON.stringify(data, null, 2));
  });
  
} catch (error) {
  console.error('Error reading Excel file:', error.message);
}