"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { addMonths, format, parseISO } from 'date-fns';
import { 
  Save, ArrowLeft, QrCode, Loader2, Calendar, 
  Package, User, Store, ShieldCheck, X
} from 'lucide-react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function EditOrder() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [storeOptions, setStoreOptions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    order_number: '',
    product_name: '',
    model: '',
    serial_number: '',
    customer_name: '',
    purchase_date: '',
    warranty_months: '12',
    store_name: '',
    sales_channel: '',
    expiry_date: ''
  });

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from('stores').select('*').order('name');
      if (data) setStoreOptions(data);
    };
    fetchStores();

    const fetchData = async () => {
      if (params?.id) {
        const { data } = await supabase.from('warranties').select('*').eq('id', params.id).single();
        if (data) {
          setFormData({
            ...data,
            warranty_months: data.warranty_months?.toString() || '12',
            purchase_date: data.purchase_date, 
            expiry_date: data.expiry_date
          });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [params?.id]);

  const handleDateCalculation = (field: string, value: string) => {
    let newData = { ...formData, [field]: value };
    if (newData.purchase_date && newData.warranty_months) {
      const expiry = format(
        addMonths(parseISO(newData.purchase_date), parseInt(newData.warranty_months)),
        'yyyy-MM-dd'
      );
      newData.expiry_date = expiry;
    }
    setFormData(newData);
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader-edit", { fps: 10, qrbox: {width:250, height:250}, videoConstraints: { facingMode: "environment" } }, false);
      scanner.render((txt) => { setFormData(prev => ({ ...prev, serial_number: txt })); setIsScanning(false); scanner.clear(); }, () => {});
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('warranties').update({...formData, warranty_months: parseInt(formData.warranty_months)}).eq('id', params?.id);
    if (error) alert('Error: ' + error.message);
    else {
      alert('บันทึกเรียบร้อย!');
      router.push('/admin/dashboard');
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 pb-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4"><Link href="/admin/dashboard" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all shadow-sm"><ArrowLeft size={20} /></Link><div><h1 className="text-2xl font-black text-slate-800">Edit Order</h1><p className="text-slate-400 text-sm">แก้ไขข้อมูล: {formData.product_name}</p></div></div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3"><Package size={18} className="text-blue-500"/> Product Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">ชื่อสินค้า</label><input required type="text" className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} /></div>
               <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">รุ่น (Model)</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-bold" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} /></div>
            </div>
            <div className="space-y-1 relative"><label className="text-xs font-bold text-slate-500 uppercase">Serial Number</label><div className="flex gap-2"><input required type="text" className="w-full p-3 pl-4 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-100 font-mono font-bold" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} /><button type="button" onClick={startScanner} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white"><QrCode size={20} /></button></div></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3"><ShieldCheck size={18} className="text-emerald-500"/> Warranty Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">วันที่ซื้อ</label><div className="relative"><input required type="date" className="w-full p-3 pl-10 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-100 font-bold" value={formData.purchase_date} onChange={e => handleDateCalculation('purchase_date', e.target.value)} /><Calendar className="absolute left-3 top-3 text-slate-400" size={18}/></div></div>
               <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">ระยะเวลาประกัน</label><select className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-100 font-bold" value={formData.warranty_months} onChange={e => handleDateCalculation('warranty_months', e.target.value)}><option value="3">3 เดือน</option><option value="6">6 เดือน</option><option value="12">1 ปี (12 เดือน)</option><option value="24">2 ปี (24 เดือน)</option></select></div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex justify-between items-center"><span className="text-sm font-bold text-emerald-700">วันหมดอายุใหม่:</span><span className="text-lg font-black text-emerald-600">{format(parseISO(formData.expiry_date || new Date().toISOString()), 'dd/MM/yyyy')}</span></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3"><User size={18} className="text-orange-500"/> Customer Info</h3>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">ชื่อลูกค้า</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-orange-100 font-bold" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Dropdown ร้านค้า */}
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">ร้านค้า</label>
                 <div className="relative">
                    <select className="w-full p-3 pl-10 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-orange-100 font-bold appearance-none" value={formData.store_name} onChange={e => setFormData({...formData, store_name: e.target.value})}>
                      <option value="">-- เลือกร้านค้า --</option>
                      {storeOptions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <Store className="absolute left-3 top-3 text-slate-400" size={18}/>
                 </div>
               </div>
               <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">ช่องทางขาย</label><select className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-orange-100 font-bold" value={formData.sales_channel} onChange={e => setFormData({...formData, sales_channel: e.target.value})}><option value="Shopee">Shopee</option><option value="Lazada">Lazada</option><option value="Line OA">Line OA</option><option value="Facebook">Facebook</option><option value="Website">Website</option><option value="หน้าร้าน">หน้าร้าน</option></select></div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">{saving ? <Loader2 className="animate-spin"/> : <Save size={20}/>} {saving ? 'Updating...' : 'Update Order'}</button>
        </form>

        {isScanning && <div className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-sm"><div className="bg-white p-6 rounded-3xl w-full max-w-xs shadow-2xl"><h3 className="font-black text-slate-800 mb-4 text-center">Scan QR</h3><div id="reader-edit" className="rounded-2xl overflow-hidden border-4 border-slate-50 aspect-square"></div><button onClick={()=>setIsScanning(false)} className="w-full mt-6 p-3 bg-slate-100 text-slate-500 rounded-xl font-bold flex justify-center gap-2 items-center"><X size={18}/> Close</button></div></div>}
      </div>
    </div>
  );
}