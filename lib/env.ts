// Environment variable validation 
export const getEnvVar = (key: string, required: boolean = true): string => {
  const value = process.env[key];
  
  if (required && !value) {
    console.error(`Environment variable ${key} is required but not set`);
    return '';
  }
  
  return value || '';
};

// Get environment variables with fallbacks
const getSupabaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not found in environment variables');
    return '';
  }
  return url;
};

const getSupabaseAnonKey = (): string => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment variables');
    return '';
  }
  return key;
};

// Supabase configuration - check for missing vars but don't throw
export const supabaseConfig = {
  url: getSupabaseUrl(),
  anonKey: getSupabaseAnonKey(),
  serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', false),
};

// Check if we're in production and have real env vars
export const isProductionReady = (): boolean => {
  return (
    Boolean(supabaseConfig.url) &&
    Boolean(supabaseConfig.anonKey) &&
    supabaseConfig.url.includes('supabase.co')
  );
};

// Development mode detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Safe environment check
export const canUseSupabase = (): boolean => {
  try {
    const hasUrl = Boolean(supabaseConfig.url) && supabaseConfig.url.startsWith('https://');
    const hasKey = Boolean(supabaseConfig.anonKey) && supabaseConfig.anonKey.length > 20;
    const notPlaceholder = !supabaseConfig.url.includes('your-project') && !supabaseConfig.anonKey.includes('your-anon');
    
    return hasUrl && hasKey && notPlaceholder;
  } catch {
    return false;
  }
};

// Check if environment variables are properly set
export const checkEnvironmentVariables = (): { isValid: boolean; missing: string[]; hasPlaceholders: boolean } => {
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  // Check for placeholder values
  const hasPlaceholders = supabaseConfig.url.includes('your-project') || 
                         supabaseConfig.anonKey.includes('your-anon');
  
  return {
    isValid: missing.length === 0 && !hasPlaceholders,
    missing,
    hasPlaceholders
  };
};

// Error handling for missing environment variables
export const handleEnvError = (error: any, context: string = 'Environment') => {
  console.error(`${context} error:`, error);
  
  if (isDevelopment) {
    console.warn(`
⚠️  Environment Configuration Warning:
- Make sure you have .env.local file with proper Supabase credentials
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Context: ${context}
    `);
  }
  
  // In production, fail silently but log
  if (isProduction) {
    console.error('Production environment error:', { error, context });
  }
}; 