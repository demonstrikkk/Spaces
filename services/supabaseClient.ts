import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../utils/env';

// Try both with and without VITE_ prefix for flexibility
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

let supabaseInstance: any = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Disable auth for now since we don't have user authentication
        autoRefreshToken: false
      }
    });
    console.log('✅ Supabase client initialized successfully');
    console.log('   URL:', supabaseUrl.substring(0, 30) + '...');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    supabaseInstance = null;
  }
} else {
  console.warn('⚠️ Supabase credentials not found, using local storage only');
  console.log('   SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.log('   SUPABASE_ANON_KEY:', supabaseKey ? 'Found' : 'Missing');
}

export const supabase = supabaseInstance;