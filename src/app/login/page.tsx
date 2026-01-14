"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // เรียกใช้ Supabase Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      setLoading(false);
    } else {
      // Login สำเร็จ -> ไปหน้า Dashboard
      router.push('/admin/dashboard');
      router.refresh(); // รีเฟรชเพื่อให้ระบบจำ Session
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Admin Login</h1>
          <p className="text-slate-400 text-sm mt-1">Plasticbag 2015 System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
            <div className="relative">
              <input 
                type="email" 
                required
                className="w-full p-4 pl-12 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700 transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required
                className="w-full p-4 pl-12 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-500 text-xs font-bold rounded-xl text-center border border-rose-100 animate-in shake">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white p-4 rounded-xl font-black text-lg shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
           <p className="text-xs text-slate-300 font-bold">Authorized Personnel Only</p>
        </div>

      </div>
    </div>
  );
}