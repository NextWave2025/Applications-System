import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/test-upload', upload.single('file'), (req, res) => {
  try {
    console.log('=== Excel Upload Test ===');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    console.log('Sheet names:', workbook.SheetNames);

    // Process Universities sheet
    let universitiesData = [];
    const universitiesSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('universities') || name.toLowerCase().includes('university')
    );
    
    if (universitiesSheetName) {
      const universitiesSheet = workbook.Sheets[universitiesSheetName];
      universitiesData = XLSX.utils.sheet_to_json(universitiesSheet);
      console.log(`Found ${universitiesData.length} universities in sheet "${universitiesSheetName}"`);
      console.log('First university:', universitiesData[0]);
    } else {
      console.log('No Universities sheet found');
    }

    // Process Programs sheet
    let programsData = [];
    const programsSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('programs') || name.toLowerCase().includes('program')
    );
    
    if (programsSheetName) {
      const programsSheet = workbook.Sheets[programsSheetName];
      programsData = XLSX.utils.sheet_to_json(programsSheet);
      console.log(`Found ${programsData.length} programs in sheet "${programsSheetName}"`);
      console.log('First program:', programsData[0]);
    } else {
      console.log('No Programs sheet found');
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      universities: universitiesData.length,
      programs: programsData.length,
      sheetsFound: workbook.SheetNames
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});