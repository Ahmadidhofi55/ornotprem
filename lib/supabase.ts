// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Buat satu instance saja untuk digunakan di seluruh aplikasi client-side
export const supabase = createClient(supabaseUrl, supabaseKey);