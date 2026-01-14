"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      // ตรวจสอบว่ามี User Login อยู่ไหม
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // ถ้าไม่มี -> ดีดกลับไปหน้า Login
        router.push('/login');
      } else {
        // ถ้ามี -> อนุญาตให้เข้าได้
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // ระหว่างตรวจสอบ ให้หมุนติ้วๆ รอไปก่อน
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
           <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-2" />
           <p className="text-slate-400 text-sm font-bold">Verifying Access...</p>
        </div>
      </div>
    );
  }

  // ถ้าผ่านการตรวจสอบแล้ว ให้แสดงเนื้อหาข้างใน (Dashboard/Add/Edit)
  return <>{children}</>;
}