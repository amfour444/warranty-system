"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { addMonths, format, parseISO } from 'date-fns';
import { 
  Save, ArrowLeft, QrCode, Loader2, Calendar, 
  Package, User, Store, ShieldCheck, X, ChevronDown, Info 
} from 'lucide-react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';

const formatDateThai = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function AddOrder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // States สำหรับ Dropdown
  const [storeOptions, setStoreOptions] = useState<any[]>([]);
  const [productPresets, setProductPresets] = useState<any[]>([]);
  const [conditionOptions, setConditionOptions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    order_number: '',
    product_name: '',
    model: '',
    serial_number: '',
    customer_name: '',
    purchase_date: format(new Date(), 'yyyy-MM-dd'),
    warranty_months: '12',
    store_name: '',
    sales_channel: '',
    warranty_condition: '', // เพิ่มฟิลด์นี้
    expiry_date: format(addMonths(new Date(), 12), 'yyyy-MM-dd')
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      const { data: s } = await supabase.from('stores').select('*').order('name');
      const { data: p } = await supabase.from('product_presets').select('*').order('name');
      const { data: c } = await supabase.from('warranty_conditions').select('*').order('title');
      if (s) setStoreOptions(s);
      if (p) setProductPresets(p);
      if (c) setConditionOptions(c);
    };
    fetchDropdowns();
  }, []);

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const item = productPresets.find(p => p.id.toString() === e.target.value);
    if (item) setFormData(prev => ({ ...prev, product_name: item.name, model: item.model || '' }));
  };

  const handleDateCalculation = (field: string, value: string) => {
    let newData = { ...formData, [field]: value };
    if (newData.purchase_date && newData.warranty_months) {
      newData.expiry_date = format(addMonths(parseISO(newData.purchase_date), parseInt(newData.warranty_months)), 'yyyy-MM-dd');
    }
    setFormData(newData);
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader-add", { 
        fps: 25, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0,
        videoConstraints: { facingMode: { exact: "environment" } } 
      }, false);
      scanner.render((txt) => {
        setFormData(prev => ({ ...prev, serial_number: txt }));
        setIsScanning(false);
        scanner.clear();
      }, () => {});
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanSN = formData.serial_number.trim();
    
    // เช็คเลขซ้ำ
    const { data: dup } = await supabase.from('warranties').select('id').eq('serial_number', cleanSN);
    if (dup && dup.length > 0) {
      alert(`❌ S/N: ${cleanSN} มีในระบบแล้ว!`);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('warranties').insert([{
      ...formData,
      serial_number: cleanSN,
      warranty_months: parseInt(formData.warranty_months)
    }]);

    if (!error) {
      alert('บันทึกเรียบร้อย ✅');
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center shadow-sm"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-black">New Order</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
               <h3 className="font-bold flex items-center gap-2 text-slate-800"><Package size={18} className="text-blue-500"/> Product Info</h3>
               <select onChange={handleSelectPreset} className="text-[10px] bg-blue-50 text-blue-600 font-bold p-2 rounded-lg outline-none">
                 <option value="">-- เลือกสินค้ามาตรฐาน --</option>
                 {productPresets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
               </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-xs font-bold text-slate-400">ชื่อสินค้า</label><input required type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} /></div>
               <div className="space-y-1"><label className="text-xs font-bold text-slate-400">รุ่น (Model)</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} /></div>
            </div>

            <div className="space-y-1"><label className="text-xs font-bold text-slate-400">Serial Number (S/N)</label><div className="flex gap-2"><input required type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-mono font-bold" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} /><button type="button" onClick={startScanner} className="p-3 bg-blue-50 text-blue-600 rounded-xl"><QrCode size={20} /></button></div></div>

            {/* ส่วนที่เพิ่มใหม่: เงื่อนไขการรับประกัน */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">เงื่อนไขการรับประกัน</label>
              <div className="relative">
                <select required className="w-full p-3 pl-10 bg-blue-50/50 border-2 border-blue-100 rounded-xl outline-none font-bold text-blue-800 appearance-none" value={formData.warranty_condition} onChange={e => setFormData({...formData, warranty_condition: e.target.value})}>
                  <option value="">-- เลือกเงื่อนไขการรับประกัน --</option>
                  {conditionOptions.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                </select>
                <Info size={18} className="absolute left-3 top-3.5 text-blue-400" />
                <ChevronDown size={18} className="absolute right-3 top-3.5 text-blue-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Warranty Details Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-slate-800"><ShieldCheck size={18} className="text-emerald-500"/> Warranty Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-xs font-bold text-slate-400">วันที่ซื้อ</label><input required type="date" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold" value={formData.purchase_date} onChange={e => handleDateCalculation('purchase_date', e.target.value)} /></div>
               <div className="space-y-1"><label className="text-xs font-bold text-slate-400">ระยะเวลาประกัน</label><select className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold" value={formData.warranty_months} onChange={e => handleDateCalculation('warranty_months', e.target.value)}><option value="3">3 เดือน</option><option value="6">6 เดือน</option><option value="12">1 ปี (12 เดือน)</option><option value="24">2 ปี (24 เดือน)</option></select></div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl flex justify-between items-center border border-emerald-100">
               <span className="text-sm font-bold text-emerald-700">หมดอายุ: {formatDateThai(formData.expiry_date)}</span>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-slate-800"><User size={18} className="text-orange-500"/> Customer Info</h3>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-400">ชื่อลูกค้า</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-xs font-bold text-slate-400">ร้านค้า</label><select className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold" value={formData.store_name} onChange={e => setFormData({...formData, store_name: e.target.value})}><option value="">-- เลือกร้านค้า --</option>{storeOptions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
               <div className="space-y-1"><label className="text-xs font-bold text-slate-400">ช่องทางขาย</label><select className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold" value={formData.sales_channel} onChange={e => setFormData({...formData, sales_channel: e.target.value})}><option value="">-- เลือก --</option><option value="Shopee">Shopee</option><option value="Lazada">Lazada</option><option value="หน้าร้าน">หน้าร้าน</option></select></div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 active:scale-95 transition-all flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} {loading ? 'Saving...' : 'Save Order'}
          </button>
        </form>

        {isScanning && <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-6"><div className="bg-white p-6 rounded-3xl w-full max-w-xs shadow-2xl"><h3 className="font-black text-center mb-4">Scan S/N</h3><div id="reader-add" className="rounded-2xl overflow-hidden border-4"></div><button onClick={()=>setIsScanning(false)} className="w-full mt-6 p-3 bg-slate-100 rounded-xl font-bold flex justify-center gap-2"><X size={18}/> Close</button></div></div>}
      </div>
    </div>
  );
}