"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { addMonths, format, parseISO } from 'date-fns';
import { 
  Save, ArrowLeft, QrCode, Loader2, Calendar, 
  Package, User, Store, ShieldCheck, ShoppingBag 
} from 'lucide-react';
import Link from 'next/link';
import QRScanner from '@/components/QRScanner'; 

const formatDateThai = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function EditOrder() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Dropdown Options
  const [storeOptions, setStoreOptions] = useState<any[]>([]);
  const [productPresets, setProductPresets] = useState<any[]>([]);
  const [conditionOptions, setConditionOptions] = useState<any[]>([]);
  const [channelOptions, setChannelOptions] = useState<any[]>([]); // 1. เพิ่ม State

  const [formData, setFormData] = useState({
    product_name: '',
    model: '',
    serial_number: '',
    customer_name: '',
    purchase_date: '',
    warranty_months: '12',
    store_name: '',
    sales_channel: '',
    warranty_condition: '',
    expiry_date: ''
  });

  useEffect(() => {
    const fetchAllData = async () => {
      // 2. ดึงข้อมูลจาก DB ทั้งหมด
      const { data: s } = await supabase.from('stores').select('*').order('name');
      const { data: p } = await supabase.from('product_presets').select('*').order('name');
      const { data: c } = await supabase.from('warranty_conditions').select('*').order('title');
      const { data: ch } = await supabase.from('sales_channels').select('*').order('name'); // เพิ่มบรรทัดนี้
      
      setStoreOptions(s || []);
      setProductPresets(p || []);
      setConditionOptions(c || []);
      setChannelOptions(ch || []); // set state

      // 3. ดึงข้อมูลออเดอร์
      if (params?.id) {
        const { data: res } = await supabase.from('warranties').select('*').eq('id', params.id).single();
        if (res) {
          setFormData({
            ...res,
            warranty_months: res.warranty_months?.toString() || '12'
          });
        }
      }
      setLoading(false);
    };
    fetchAllData();
  }, [params?.id]);

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const item = productPresets.find(p => p.id.toString() === e.target.value);
    if (item) {
      setFormData(prev => ({ 
        ...prev, 
        product_name: item.name, 
        model: item.model || '' 
      }));
    }
  };

  const handleDateCalculation = (field: string, value: string) => {
    let newData = { ...formData, [field]: value };
    if (newData.purchase_date && newData.warranty_months) {
      newData.expiry_date = format(addMonths(parseISO(newData.purchase_date), parseInt(newData.warranty_months)), 'yyyy-MM-dd');
    }
    setFormData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const cleanSN = formData.serial_number.trim();

    const { error } = await supabase.from('warranties').update({
      ...formData,
      serial_number: cleanSN,
      warranty_months: parseInt(formData.warranty_months)
    }).eq('id', params?.id);

    if (!error) {
      alert('อัปเดตข้อมูลเรียบร้อย ✅');
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      alert(error.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-black text-slate-800">Edit Order</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
               <h3 className="font-bold flex items-center gap-2 text-slate-800"><Package size={18} className="text-blue-500"/> ข้อมูลสินค้า</h3>
               <select onChange={handleSelectPreset} className="text-[10px] bg-blue-50 text-blue-600 font-bold p-2 px-3 rounded-lg outline-none cursor-pointer">
                 <option value="">-- เปลี่ยนเป็นสินค้ามาตรฐาน --</option>
                 {productPresets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
               </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400">ชื่อสินค้า</label>
                 <input required type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold focus:ring-2 focus:ring-blue-100" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400">รุ่น (Model)</label>
                 <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold focus:ring-2 focus:ring-blue-100" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
               </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Serial Number (S/N)</label>
              <div className="flex gap-2">
                <input required type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-mono font-bold text-blue-600 focus:ring-2 focus:ring-blue-100" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} />
                <button type="button" onClick={() => setIsScanning(true)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                  <QrCode size={20} />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">เงื่อนไขการรับประกัน</label>
              <select required className="w-full p-3 bg-blue-50/50 border-2 border-blue-50 rounded-xl outline-none font-bold text-blue-800" value={formData.warranty_condition} onChange={e => setFormData({...formData, warranty_condition: e.target.value})}>
                <option value="">-- เลือกเงื่อนไขการรับประกัน --</option>
                {conditionOptions.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-50 pb-3 flex items-center gap-2 text-slate-800"><ShieldCheck size={18} className="text-emerald-500"/> ข้อมูลการรับประกัน</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400">วันที่ซื้อ</label>
                 <input required type="date" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold focus:ring-2 focus:ring-blue-100" value={formData.purchase_date} onChange={e => handleDateCalculation('purchase_date', e.target.value)} />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400">ระยะเวลาประกัน</label>
                 <select className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold cursor-pointer" value={formData.warranty_months} onChange={e => handleDateCalculation('warranty_months', e.target.value)}>
                   <option value="3">3 เดือน</option>
                   <option value="6">6 เดือน</option>
                   <option value="12">1 ปี (12 เดือน)</option>
                   <option value="24">2 ปี (24 เดือน)</option>
                 </select>
               </div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl flex justify-between items-center border border-emerald-100 shadow-inner">
               <span className="text-sm font-bold text-emerald-700">หมดอายุใหม่: {formatDateThai(formData.expiry_date)}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold border-b border-slate-50 pb-3 flex items-center gap-2 text-slate-800"><User size={18} className="text-orange-500"/> ข้อมูลลูกค้าและการจัดส่ง</h3>
            
            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-400">ชื่อลูกค้า / ชื่อบริษัท</label>
               <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold focus:ring-2 focus:ring-blue-100" value={formData.customer_name || ''} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400 flex items-center gap-1"><Store size={12}/> ร้านค้า</label>
                 <select className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold cursor-pointer" value={formData.store_name || ''} onChange={e => setFormData({...formData, store_name: e.target.value})}>
                   <option value="">-- เลือกร้านค้า --</option>
                   {storeOptions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                 </select>
               </div>
               
               {/* 3. Dropdown ช่องทางขายแบบ Dynamic */}
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400 flex items-center gap-1"><ShoppingBag size={12}/> ช่องทางขาย</label>
                 <select 
                   className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold cursor-pointer" 
                   value={formData.sales_channel || ''} 
                   onChange={e => setFormData({...formData, sales_channel: e.target.value})}
                 >
                   <option value="">-- เลือกช่องทาง --</option>
                   {channelOptions.map(c => (
                     <option key={c.id} value={c.name}>{c.name}</option>
                   ))}
                 </select>
               </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-all flex justify-center items-center gap-2">
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} {saving ? 'Saving...' : 'Update Warranty'}
          </button>
        </form>

        <QRScanner 
          isOpen={isScanning} 
          onClose={() => setIsScanning(false)}
          onScan={(code) => {
             setFormData(prev => ({ ...prev, serial_number: code }));
             setIsScanning(false);
          }}
        />
      </div>
    </div>
  );
}