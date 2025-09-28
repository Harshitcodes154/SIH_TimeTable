
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables exist and are not placeholder values
const isValidConfig = supabaseUrl && 
                      supabaseKey && 
                      supabaseUrl !== 'https://placeholder.supabase.co' && 
                      supabaseKey !== 'placeholder-key' &&
                      !supabaseUrl.includes('placeholder') &&
                      !supabaseKey.includes('placeholder');

if (!isValidConfig) {
  throw new Error(
    'Supabase is not properly configured. Please set up your actual NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
  );
}

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
