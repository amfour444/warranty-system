import { createClient } from '@supabase/supabase-js';

// อย่าลืมไปเอา URL กับ Key จาก Supabase Project Settings มาใส่นะครับ
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // เก็บ Session ไว้ใน LocalStorage
      autoRefreshToken: true, // ให้รีเฟรช Token อัตโนมัติ
      detectSessionInUrl: true // ตรวจสอบ Session จาก URL (ถ้ามี)
    }
  })