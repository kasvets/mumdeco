// Environment variable validation with detailed error
const getEnvVar = (key: string, required: boolean = true): string => {
  if (typeof window !== 'undefined') {
    // Client-side: only check NEXT_PUBLIC_ vars
    if (!key.startsWith('NEXT_PUBLIC_')) {
      return '';
    }
  }
  
  const value = process.env[key];
  
  if (required && !value) {
    console.error(`
❌ Missing Required Environment Variable: ${key}
This variable is required for the application to function properly.
Please add it to your .env.local file or deployment environment.

Example .env.local:
${key}=your-${key.toLowerCase()}-here
    `);
    return '';
  }
  
  return value || '';
};

// Get environment variables with fallbacks
const getSupabaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
};

const getSupabaseAnonKey = (): string => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
};

const getSiteUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    // Development için localhost kullan
    return process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://mumdeco.com';
  }
  return url;
};

// Client-side safe Supabase configuration
export const supabaseConfig = {
  url: getSupabaseUrl(),
  anonKey: getSupabaseAnonKey(),
  siteUrl: getSiteUrl(),
};

// Server-side only Supabase configuration - only import in server components!
export const getServerConfig = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getServerConfig can only be used in server components');
  }
  
  return {
    ...supabaseConfig,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
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

// Safe environment check for client
export const canUseSupabase = (): boolean => {
  try {
    const hasUrl = Boolean(supabaseConfig.url);
    const hasKey = Boolean(supabaseConfig.anonKey);
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
  
  // Log detailed status in development
  if (isDevelopment && (missing.length > 0 || hasPlaceholders)) {
    console.error(`
❌ Environment Configuration Error:

Missing Variables:
${missing.map(key => `- ${key}`).join('\n')}

Current Configuration:
- NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}

Please update your .env.local file with the correct values.
    `);
  }
  
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