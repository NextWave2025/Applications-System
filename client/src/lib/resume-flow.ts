/**
 * Resume Flow Helper Utility
 * 
 * Manages storing and retrieving user application intent for seamless resume after login/signup.
 * Supports both regular Apply and Quick Apply flows.
 */

export interface ResumeData {
  programId: string;
  action: 'apply' | 'quick-apply';
  redirectUrl: string;
  timestamp: number;
  programName?: string;
  universityName?: string;
}

const RESUME_KEY = 'nextwave_resume_flow';
const EXPIRE_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Store user's intended application action before redirecting to auth
 */
export function storeResumeData(data: Omit<ResumeData, 'timestamp'>): void {
  try {
    const resumeData: ResumeData = {
      ...data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(RESUME_KEY, JSON.stringify(resumeData));
    console.log('Resume data stored:', resumeData);
  } catch (error) {
    console.error('Failed to store resume data:', error);
  }
}

/**
 * Retrieve stored resume data
 */
export function getResumeData(): ResumeData | null {
  try {
    const stored = localStorage.getItem(RESUME_KEY);
    if (!stored) return null;
    
    const data: ResumeData = JSON.parse(stored);
    
    // Check if data has expired
    if (Date.now() - data.timestamp > EXPIRE_TIME) {
      console.log('Resume data expired, clearing');
      clearResumeData();
      return null;
    }
    
    console.log('Resume data retrieved:', data);
    return data;
  } catch (error) {
    console.error('Failed to retrieve resume data:', error);
    clearResumeData();
    return null;
  }
}

/**
 * Clear stored resume data
 */
export function clearResumeData(): void {
  try {
    localStorage.removeItem(RESUME_KEY);
    // Also clear legacy keys for compatibility
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('applicationAction');
    localStorage.removeItem('programId');
    console.log('Resume data cleared');
  } catch (error) {
    console.error('Failed to clear resume data:', error);
  }
}

/**
 * Check if a program exists and is accessible
 */
export async function validateProgram(programId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/programs/${programId}`);
    return response.ok;
  } catch (error) {
    console.error('Failed to validate program:', error);
    return false;
  }
}

/**
 * Get fallback redirect URL when program is invalid
 */
export function getFallbackUrl(): string {
  return '/programs';
}

/**
 * Handle resume after successful authentication
 */
export async function handleResumeFlow(): Promise<string | null> {
  const resumeData = getResumeData();
  
  if (!resumeData) {
    console.log('No resume data found, using default redirect');
    return null;
  }
  
  console.log('Processing resume flow:', resumeData);
  
  // Validate the program still exists
  const isValidProgram = await validateProgram(resumeData.programId);
  
  if (!isValidProgram) {
    console.warn('Program no longer exists, redirecting to fallback');
    clearResumeData();
    return getFallbackUrl();
  }
  
  // Clear resume data before redirect to prevent reuse
  clearResumeData();
  
  // Return the appropriate redirect URL based on action type
  return resumeData.redirectUrl;
}

/**
 * Create resume data for regular Apply action
 */
export function createApplyResumeData(programId: string, programName?: string, universityName?: string): ResumeData {
  return {
    programId,
    action: 'apply',
    redirectUrl: `/apply/${programId}`,
    timestamp: Date.now(),
    programName,
    universityName
  };
}

/**
 * Create resume data for Quick Apply action
 */
export function createQuickApplyResumeData(programId: string, programName?: string, universityName?: string): ResumeData {
  return {
    programId,
    action: 'quick-apply',
    redirectUrl: `/apply/${programId}?mode=quick&from=card`,
    timestamp: Date.now(),
    programName,
    universityName
  };
}