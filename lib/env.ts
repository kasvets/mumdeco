// Environment variable validation and fallbacks
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env[key] || defaultValue;
  }
  
  // Server-side
  return process.env[key] || defaultValue;
};

// Supabase configuration with fallbacks
export const supabaseConfig = {
  url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co'),
  anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'dummy-key'),
  serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'dummy-service-key'),
};

// Check if we're in production and have real env vars
export const isProductionReady = (): boolean => {
  return (
    supabaseConfig.url !== 'https://example.supabase.co' &&
    supabaseConfig.anonKey !== 'dummy-key' &&
    supabaseConfig.url.includes('supabase.co')
  );
};

// Development mode detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Safe environment check
export const canUseSupabase = (): boolean => {
  try {
    return Boolean(
      supabaseConfig.url &&
      supabaseConfig.anonKey &&
      supabaseConfig.url.startsWith('https://') &&
      supabaseConfig.anonKey.length > 10
    );
  } catch {
    return false;
  }
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