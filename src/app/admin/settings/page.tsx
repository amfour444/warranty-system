"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Settings() {
  const [stores, setStores] = useState<any[]>([]);
  const [newStore, setNewStore] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: true });
    if (data) setStores(data);
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('stores').insert([{ name: newStore.trim() }]);
    
    if (error) {
      // ถ้าชื่อซ้ำ (Error code 23505)
      if (error.code === '23505') alert('ชื่อร้านค้านี้มีอยู่แล้ว');
      else alert('Error: ' + error.message);
    } else {
      setNewStore('');
      fetchStores();
    }
    setLoading(false);
  };

  const handleDeleteStore = async (id: number) => {
    if (confirm('ต้องการลบร้านค้านี้ใช่หรือไม่?')) {
      await supabase.from('stores').delete().eq('id', id);
      fetchStores();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Settings</h1>
            <p className="text-slate-400 text-sm">จัดการข้อมูลร้านค้า</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-blue-500"/> เพิ่มร้านค้าใหม่
          </h3>
          <form onSubmit={handleAddStore} className="flex gap-2">
            <input 
              type="text" 
              placeholder="ชื่อร้านค้า (เช่น JD Central)" 
              className="flex-1 p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700"
              value={newStore}
              onChange={(e) => setNewStore(e.target.value)}
            />
            <button disabled={loading} type="submit" className="bg-slate-900 text-white px-5 rounded-xl font-bold hover:bg-slate-800 transition-all">
              {loading ? '...' : 'บันทึก'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50">
             <h3 className="font-bold text-slate-500 text-xs uppercase">รายชื่อร้านค้า ({stores.length})</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {stores.map((store) => (
              <div key={store.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                    <Store size={16} />
                  </div>
                  <span className="font-bold text-slate-700">{store.name}</span>
                </div>
                <button onClick={() => handleDeleteStore(store.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {stores.length === 0 && <div className="p-6 text-center text-slate-400 text-sm">ยังไม่มีข้อมูล</div>}
          </div>
        </div>
      </div>
    </div>
  );
}