import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Summary {
  id: string;
  original_text: string;
  summarized_text: string;
  translated_text: string | null;
  created_at: string;
  word_count_original: number;
  word_count_summary: number;
}
