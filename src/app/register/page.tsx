"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState(''); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ตั้งค่ารหัสลับสำหรับคนที่จะมาสมัคร
  const MASTER_ADMIN_KEY = "PLASTICBAG2015"; 

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. เช็ครหัสลับ Admin Key
    if (adminKey !== MASTER_ADMIN_KEY) {
      alert("❌ Admin Key ไม่ถูกต้อง! ไม่สามารถสร้างบัญชีได้");
      setLoading(false);
      return;
    }

    // 2. สั่งสมัครสมาชิกพร้อมกำหนด Role เป็น staff
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'staff'
        }
      }
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("✅ สมัครสมาชิกสำเร็จ! ระบบกำลังพาไปหน้า Login");
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-100">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800">Register</h1>
          <p className="text-slate-400 mt-2 font-medium">สร้างบัญชีผู้ดูแลระบบใหม่</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
            <div className="relative">
              <input required type="email" placeholder="admin@company.com" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
            <div className="relative">
              <input required type="password" placeholder="••••••••" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-blue-600 uppercase ml-1">Admin Secret Key</label>
            <div className="relative">
              <input required type="text" placeholder="กรอกรหัสลับเพื่อสมัคร" className="w-full p-4 pl-12 bg-blue-50 rounded-2xl border-2 border-blue-100 outline-none focus:ring-2 focus:ring-blue-200 font-bold transition-all text-blue-700" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />
              <ShieldCheck className="absolute left-4 top-4 text-blue-500" size={20} />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <Link href="/login" className="text-slate-400 hover:text-blue-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}