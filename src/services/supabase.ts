import { createClient } from '@supabase/supabase-js';

// Get environment variables - Expo automatically exposes EXPO_PUBLIC_* variables
// @ts-ignore - Expo injects these at build time
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://hwclojaalnzruviubxju.supabase.co';
// @ts-ignore - Expo injects these at build time
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2xvamFhbG56cnV2aXVieGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODE2MzQsImV4cCI6MjA3OTY1NzYzNH0.b7E_0vAPxXauNxSn6MoSpOLLN5dOB3oaiRgJjbajJAE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
