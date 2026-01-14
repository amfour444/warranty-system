import { createClient } from '@supabase/supabase-js';

// อย่าลืมไปเอา URL กับ Key จาก Supabase Project Settings มาใส่นะครับ
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);