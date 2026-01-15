import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // ให้เก็บ Session ไว้
    autoRefreshToken: true,    // ต่ออายุอัตโนมัติ
    detectSessionInUrl: true,  // ตรวจสอบจาก URL (สำคัญสำหรับ OAuth/Email Link)
    storageKey: 'warranty-auth-token' // กำหนดชื่อ Key เองเพื่อป้องกันการตีกันของโปรเจกต์อื่น
  }
})