import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client factory
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables for server-side client');
    throw new Error('Supabase server configuration is missing');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Singleton instance for server-side operations
let _serverSupabase: SupabaseClient | null = null;

export function getServerSupabaseClient() {
  if (!_serverSupabase) {
    _serverSupabase = createServerSupabaseClient();
  }
  return _serverSupabase;
}

// For build-time safety, only create client when actually needed
export function createServerSupabaseClientSafe() {
  try {
    return createServerSupabaseClient();
  } catch (error) {
    // During build time, return a mock client that will fail gracefully
    console.warn('Supabase server client not available during build time');
    return null;
  }
} 