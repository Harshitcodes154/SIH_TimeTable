
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if environment variables exist and are not placeholder values
export const isValidConfig = () => {
  return supabaseUrl && 
         supabaseKey && 
         supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseKey !== 'placeholder-key' &&
         !supabaseUrl.includes('placeholder') &&
         !supabaseKey.includes('placeholder');
};

export const createClient = () => {
  // Only validate in browser environment, not during build
  if (typeof window !== 'undefined' && !isValidConfig()) {
    console.warn('Supabase is not properly configured. Using placeholder configuration.');
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
};
