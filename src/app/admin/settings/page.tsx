"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Store, ArrowLeft, Package, Save } from 'lucide-react';
import Link from 'next/link';

export default function Settings() {
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [newStore, setNewStore] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', model: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: s } = await supabase.from('stores').select('*').order('created_at');
    if (s) setStores(s);
    
    const { data: p } = await supabase.from('product_presets').select('*').order('name');
    if (p) setProducts(p);
  };

  // --- จัดการร้านค้า ---
  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.trim()) return;
    setLoading(true);
    await supabase.from('stores').insert([{ name: newStore.trim() }]);
    setNewStore('');
    fetchData();
    setLoading(false);
  };

  const handleDeleteStore = async (id: number) => {
    if (confirm('ลบร้านค้านี้?')) {
      await supabase.from('stores').delete().eq('id', id);
      fetchData();
    }
  };

  // --- จัดการสินค้า ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;
    setLoading(true);
    await supabase.from('product_presets').insert([newProduct]);
    setNewProduct({ name: '', model: '' });
    fetchData();
    setLoading(false);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('ลบสินค้านี้?')) {
      await supabase.from('product_presets').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div><h1 className="text-2xl font-black text-slate-800">Settings</h1><p className="text-slate-400 text-sm">จัดการข้อมูลพื้นฐาน</p></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 1: จัดการสินค้า (Product Presets) */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Package size={20} className="text-blue-500"/> ตั้งค่าสินค้ามาตรฐาน</h3>
            
            {/* Form เพิ่มสินค้า */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
               <form onSubmit={handleAddProduct} className="space-y-2">
                 <input type="text" placeholder="ชื่อสินค้า (เช่น เครื่องซีล)" className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none text-sm font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                 <div className="flex gap-2">
                   <input type="text" placeholder="รุ่น (Model)" className="flex-1 p-3 bg-slate-50 rounded-xl border-none outline-none text-sm font-bold" value={newProduct.model} onChange={e => setNewProduct({...newProduct, model: e.target.value})} />
                   <button disabled={loading} type="submit" className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 transition-all"><Plus/></button>
                 </div>
               </form>
            </div>

            {/* List สินค้า */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-h-[400px] overflow-y-auto">
               {products.map((p) => (
                 <div key={p.id} className="p-3 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-700 text-sm">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.model || '-'}</div>
                    </div>
                    <button onClick={() => handleDeleteProduct(p.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                 </div>
               ))}
            </div>
          </div>

          {/* Section 2: จัดการร้านค้า (Stores) */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Store size={20} className="text-orange-500"/> ตั้งค่าร้านค้า</h3>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
               <form onSubmit={handleAddStore} className="flex gap-2">
                 <input type="text" placeholder="ชื่อร้านค้า..." className="flex-1 p-3 bg-slate-50 rounded-xl border-none outline-none text-sm font-bold" value={newStore} onChange={e => setNewStore(e.target.value)} />
                 <button disabled={loading} type="submit" className="bg-orange-500 text-white px-4 rounded-xl hover:bg-orange-600 transition-all"><Plus/></button>
               </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-h-[400px] overflow-y-auto">
               {stores.map((s) => (
                 <div key={s.id} className="p-3 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50">
                    <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                    <button onClick={() => handleDeleteStore(s.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}