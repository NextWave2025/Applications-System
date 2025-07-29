import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { universities, programs } from './shared/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pgConnection = postgres(connectionString);
const db = drizzle(pgConnection);

interface CSVRow {
  Field: string;
  'Degree Level': string;
  'Name of Degree': string;
  'University name': string;
  'Annual Fee': string;
  Duration: string;
  Intakes: string;
  'General Entry Requirements and Documents': string;
  'Language of teaching': string;
  'Scholarships available': string;
}

// Map degree levels to our schema format
function mapDegreeLevel(degreeLevel: string): string {
  const level = degreeLevel.toLowerCase().trim();
  if (level.includes('foundation') || level.includes('school')) return 'Foundation';
  if (level.includes('diploma') || level.includes('othm')) return 'Diploma';
  if (level.includes('undergraduate') || level.includes('bachelor')) return 'Degree (Undergraduate)';
  if (level.includes('postgraduate') || level.includes('master') || level.includes('doctorate')) return 'Postgraduate (Master\'s / PhD)';
  return 'Degree (Undergraduate)'; // default fallback
}

// Map study fields to our standardized categories
function mapStudyField(field: string): string {
  const fieldLower = field.toLowerCase();
  
  if (fieldLower.includes('business') || fieldLower.includes('management') || 
      fieldLower.includes('finance') || fieldLower.includes('accounting') || 
      fieldLower.includes('commerce') || fieldLower.includes('marketing')) {
    return 'Business & Management';
  }
  
  if (fieldLower.includes('computer') || fieldLower.includes('information technology') || 
      fieldLower.includes('data') || fieldLower.includes('artificial intelligence') || 
      fieldLower.includes('cyber') || fieldLower.includes('software')) {
    return 'Computer Science & IT';
  }
  
  if (fieldLower.includes('engineering') || fieldLower.includes('civil') || 
      fieldLower.includes('mechanical') || fieldLower.includes('electrical') || 
      fieldLower.includes('aerospace') || fieldLower.includes('biomedical')) {
    return 'Engineering';
  }
  
  if (fieldLower.includes('medicine') || fieldLower.includes('health') || 
      fieldLower.includes('nursing') || fieldLower.includes('pharmacy') || 
      fieldLower.includes('dentistry') || fieldLower.includes('biomedical')) {
    return 'Medicine & Health';
  }
  
  if (fieldLower.includes('law') || fieldLower.includes('legal')) {
    return 'Law & Politics';
  }
  
  if (fieldLower.includes('art') || fieldLower.includes('design') || 
      fieldLower.includes('fashion') || fieldLower.includes('architecture') || 
      fieldLower.includes('interior') || fieldLower.includes('animation')) {
    return 'Arts & Humanities';
  }
  
  if (fieldLower.includes('media') || fieldLower.includes('communication') || 
      fieldLower.includes('journalism') || fieldLower.includes('film') || 
      fieldLower.includes('television') || fieldLower.includes('graphic')) {
    return 'Media & Design';
  }
  
  if (fieldLower.includes('education') || fieldLower.includes('teaching') || 
      fieldLower.includes('language')) {
    return 'Education & Languages';
  }
  
  if (fieldLower.includes('psychology') || fieldLower.includes('social') || 
      fieldLower.includes('humanities') || fieldLower.includes('sociology')) {
    return 'Social Sciences';
  }
  
  return 'Business & Management'; // default fallback
}

// Map location to UAE cities
function mapLocation(universityName: string): string {
  const name = universityName.toLowerCase();
  
  // Known university location mappings based on the data
  if (name.includes('ajman')) return 'Ajman';
  if (name.includes('ras al khaimah') || name.includes('rak')) return 'Ras Al Khaimah';
  if (name.includes('sharjah')) return 'Sharjah';
  if (name.includes('abu dhabi')) return 'Abu Dhabi';
  
  // Default to Dubai for most universities
  return 'Dubai';
}

// Clean and normalize intake periods
function normalizeIntakes(intakes: string): string {
  const intake = intakes.toLowerCase().trim();
  
  if (intake.includes('jan') && intake.includes('sep')) {
    return 'January, September';
  }
  if (intake.includes('jan') && intake.includes('may')) {
    return 'January, May';
  }
  if (intake.includes('sep') && intake.includes('may')) {
    return 'May, September';
  }
  if (intake.includes('jan')) {
    return 'January';
  }
  if (intake.includes('may')) {
    return 'May';
  }
  if (intake.includes('sep')) {
    return 'September';
  }
  if (intake.includes('all')) {
    return 'January, May, September';
  }
  
  return 'September'; // default fallback
}

// Generate a placeholder image URL based on university name
function generateImageUrl(universityName: string): string {
  const baseName = universityName.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=200&fit=crop&crop=top&auto=format&q=60`;
}

async function importData() {
  console.log('Starting CSV data import...');
  
  try {
    // Read and parse CSV
    const csvContent = fs.readFileSync('attached_assets/University_Programs_Dataset_1753806823317.csv', 'utf-8');
    const records: CSVRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${records.length} records in CSV`);

    // Get unique universities
    const uniqueUniversities = new Set<string>();
    records.forEach(record => {
      if (record['University name']?.trim()) {
        uniqueUniversities.add(record['University name'].trim());
      }
    });

    console.log(`Found ${uniqueUniversities.size} unique universities`);

    // Insert universities first
    const universityInserts = Array.from(uniqueUniversities).map(name => ({
      name: name,
      location: mapLocation(name),
      imageUrl: generateImageUrl(name)
    }));

    console.log('Inserting universities...');
    const insertedUniversities = await db.insert(universities)
      .values(universityInserts)
      .returning();

    console.log(`Inserted ${insertedUniversities.length} universities`);

    // Create university name to ID mapping
    const universityMap = new Map<string, number>();
    insertedUniversities.forEach(uni => {
      universityMap.set(uni.name, uni.id);
    });

    // Process programs
    const programInserts = [];
    let skippedCount = 0;

    for (const record of records) {
      // Skip records without essential data
      if (!record['University name']?.trim() || !record['Name of Degree']?.trim()) {
        skippedCount++;
        continue;
      }

      const universityId = universityMap.get(record['University name'].trim());
      if (!universityId) {
        skippedCount++;
        continue;
      }

      // Clean and prepare program data
      const requirements = {
        academic: record['General Entry Requirements and Documents'] || 'Standard entry requirements apply',
        language: record['Language of teaching'] || 'English',
        documents: ['Passport', 'Academic transcripts', 'English proficiency certificate']
      };

      const programData = {
        name: record['Name of Degree'].trim(),
        universityId: universityId,
        tuition: record['Annual Fee'] || 'Contact university for fees',
        duration: record['Duration'] || '3-4 years',
        intake: normalizeIntakes(record['Intakes'] || 'September'),
        degree: mapDegreeLevel(record['Degree Level'] || 'Undergraduate'),
        studyField: mapStudyField(record['Field'] || record['Name of Degree']),
        requirements: requirements,
        hasScholarship: record['Scholarships available'] ? record['Scholarships available'].trim().length > 0 : false,
        imageUrl: generateImageUrl(record['University name'])
      };

      programInserts.push(programData);
    }

    console.log(`Prepared ${programInserts.length} programs for insertion (skipped ${skippedCount} invalid records)`);

    // Insert programs in batches
    const batchSize = 100;
    let insertedPrograms = 0;

    for (let i = 0; i < programInserts.length; i += batchSize) {
      const batch = programInserts.slice(i, i + batchSize);
      try {
        await db.insert(programs).values(batch);
        insertedPrograms += batch.length;
        console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(programInserts.length/batchSize)} (${insertedPrograms} total programs)`);
      } catch (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }

    console.log('\n✅ Data import completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Universities: ${insertedUniversities.length}`);
    console.log(`   - Programs: ${insertedPrograms}`);
    console.log(`   - Skipped records: ${skippedCount}`);

  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await pgConnection.end();
  }
}

// Run the import
importData();