import { checkDatabaseConnection } from './db';

export async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      console.log('✅ Database connection successful');
      return { success: true, message: 'Database connected successfully' };
    } else {
      console.log('❌ Database connection failed');
      return { success: false, message: 'Database connection failed' };
    }
  } catch (error) {
    console.error('❌ Database test error:', error);
    return { 
      success: false, 
      message: 'Database test error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 