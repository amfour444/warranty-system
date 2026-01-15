"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Store, ArrowLeft, Package, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // States สำหรับข้อมูล
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  
  // States สำหรับฟอร์มเพิ่มข้อมูล
  const [newStore, setNewStore] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', model: '' });
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'admin') {
        alert('❌ สำหรับ Admin เท่านั้น');
        router.push('/admin/dashboard');
        return;
      }
      fetchData();
    } else {
      router.push('/login');
    }
  };

  const fetchData = async () => {
    // ดึงร้านค้า
    const { data: s } = await supabase.from('stores').select('*').order('name');
    // ดึงสินค้ามาตรฐาน
    const { data: p } = await supabase.from('product_presets').select('*').order('name');
    // ดึงเงื่อนไขการรับประกัน
    const { data: c } = await supabase.from('warranty_conditions').select('*').order('created_at');

    setStores(s || []);
    setProducts(p || []);
    setConditions(c || []);
    setLoading(false);
  };

  // --- Functions สำหรับจัดการข้อมูล ---
  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.trim()) return;
    await supabase.from('stores').insert([{ name: newStore.trim() }]);
    setNewStore('');
    fetchData();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;
    await supabase.from('product_presets').insert([newProduct]);
    setNewProduct({ name: '', model: '' });
    fetchData();
  };

  const handleAddCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondition.trim()) return;
    await supabase.from('warranty_conditions').insert([{ title: newCondition.trim() }]);
    setNewCondition('');
    fetchData();
  };

  const handleDelete = async (table: string, id: number) => {
    if (confirm('ยืนยันการลบข้อมูลนี้?')) {
      await supabase.from(table).delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Settings</h1>
            <p className="text-slate-400 text-sm">จัดการข้อมูลพื้นฐานของระบบ</p>
          </div>
        </div>

        {/* ตะแกรงจัดการข้อมูล (3 คอลัมน์บน Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. จัดการร้านค้า */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Store size={20} className="text-orange-500"/> ตั้งค่าร้านค้า</h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
               <form onSubmit={handleAddStore} className="flex gap-2">
                 <input type="text" placeholder="ชื่อร้านค้า..." className="flex-1 p-3 bg-slate-50 rounded-xl border-none outline-none text-sm font-bold" value={newStore} onChange={e => setNewStore(e.target.value)} />
                 <button type="submit" className="bg-orange-500 text-white px-4 rounded-xl hover:bg-orange-600 transition-all"><Plus/></button>
               </form>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
               {stores.map((s) => (
                 <div key={s.id} className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                    <button onClick={() => handleDelete('stores', s.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                 </div>
               ))}
            </div>
          </div>

          {/* 2. จัดการสินค้ามาตรฐาน */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Package size={20} className="text-blue-500"/> สินค้ามาตรฐาน</h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
               <form onSubmit={handleAddProduct} className="space-y-2">
                 <input type="text" placeholder="ชื่อสินค้า..." className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none text-sm font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                 <div className="flex gap-2">
                   <input type="text" placeholder="รุ่น (Model)" className="flex-1 p-3 bg-slate-50 rounded-xl border-none outline-none text-sm font-bold" value={newProduct.model} onChange={e => setNewProduct({...newProduct, model: e.target.value})} />
                   <button type="submit" className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 transition-all"><Plus/></button>
                 </div>
               </form>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
               {products.map((p) => (
                 <div key={p.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-700 text-sm">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{p.model || '-'}</div>
                    </div>
                    <button onClick={() => handleDelete('product_presets', p.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                 </div>
               ))}
            </div>
          </div>

          {/* 3. จัดการเงื่อนไขการรับประกัน */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><ShieldCheck size={20} className="text-emerald-500"/> เงื่อนไขการรับประกัน</h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
               <form onSubmit={handleAddCondition} className="flex gap-2">
                 <input type="text" placeholder="เพิ่มเงื่อนไขการรับประกัน..." className="flex-1 p-3 bg-slate-50 rounded-xl border-none outline-none text-sm font-bold" value={newCondition} onChange={e => setNewCondition(e.target.value)} />
                 <button type="submit" className="bg-emerald-500 text-white px-4 rounded-xl hover:bg-emerald-600 transition-all"><Plus/></button>
               </form>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
               {conditions.map((c) => (
                 <div key={c.id} className="p-4 flex justify-between items-start hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-slate-700 text-xs leading-relaxed flex-1 pr-4">{c.title}</span>
                    <button onClick={() => handleDelete('warranty_conditions', c.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}