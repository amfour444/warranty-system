"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Search, QrCode, ShieldCheck, Package, PhoneCall, ExternalLink, X, 
  User, Store, ShoppingBag, ShieldAlert 
} from 'lucide-react';
import { format, parseISO, isAfter, differenceInDays } from 'date-fns';
import { useSearchParams } from 'next/navigation';

// ฟังก์ชันดึงค่าจาก URL (?sn=...)
function SearchHandler({ onSearch }: { onSearch: (sn: string) => void }) {
  const s = useSearchParams();
  useEffect(() => { if(s.get('sn')) onSearch(s.get('sn')!) }, [s]);
  return null;
}

// ฟังก์ชันแปลงวันที่ไทย (เพื่อให้ลูกค้าดูง่าย)
const formatDateThai = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function Check() {
  const [sn, setSn] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scan, setScan] = useState(false);

  const handleSearch = async (val: string) => {
    if(!val) return;
    setLoading(true); setError(''); setData(null); setSn(val);
    
    const { data: res, error: err } = await supabase
      .from('warranties')
      .select('*') // ดึงทุกคอลัมน์รวมถึง store_name, sales_channel, customer_name
      .eq('serial_number', val.trim())
      .single();

    if(res) setData(res); 
    else setError('ไม่พบข้อมูล Serial Number นี้ในระบบ');
    setLoading(false);
  };

  const startScan = () => {
    setScan(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width:200, height:200}, videoConstraints: { facingMode: "environment" } }, false);
      scanner.render((txt) => { handleSearch(txt); setScan(false); scanner.clear(); }, ()=>{});
    }, 300);
  };

  const active = data ? isAfter(parseISO(data.expiry_date), new Date()) : false;
  const daysLeft = data ? differenceInDays(parseISO(data.expiry_date), new Date()) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans text-slate-900">
      <Suspense><SearchHandler onSearch={handleSearch}/></Suspense>
      
      <div className="max-w-sm w-full space-y-5 py-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="text-white" size={24}/>
          </div>
          <h1 className="text-xl font-black text-slate-800">Check Warranty</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Plasticbag 2015 System</p>
        </div>

        {/* Input Section */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Serial Number..." 
            className="w-full p-4 pl-11 bg-white rounded-xl shadow-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" 
            value={sn} 
            onChange={e=>setSn(e.target.value)} 
          />
          <Search className="absolute left-3.5 top-4 text-slate-300" size={20}/>
          <button onClick={startScan} className="absolute right-2 top-2 p-2 bg-slate-50 text-slate-500 rounded-lg"><QrCode size={20}/></button>
        </div>
        
        <button 
          onClick={()=>handleSearch(sn)} 
          disabled={loading} 
          className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold shadow-md hover:bg-slate-800 transition-all disabled:bg-slate-300"
        >
          {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะ'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <ShieldAlert size={20}/>
            <p className="font-bold text-xs">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {data && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            
            {/* Status Banner */}
            <div className={`py-3 px-5 flex justify-between items-center ${active?'bg-emerald-500':'bg-rose-500'}`}>
               <span className="text-white text-[10px] font-black uppercase tracking-wider">Status</span>
               <div className="flex items-center gap-2">
                 <span className="text-white text-xs font-bold">{active?'คุ้มครองปกติ':'หมดประกันแล้ว'}</span>
                 <div className="bg-white/20 p-1 rounded-full"><ShieldCheck size={14} className="text-white"/></div>
               </div>
            </div>

            <div className="p-5 space-y-5">
              
              {/* Product Info */}
              <div className="flex gap-3 items-start">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                  <Package size={24}/>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Product</p>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight">{data.product_name}</h3>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {data.model || '-'}
                  </span>
                </div>
              </div>

              {/* Serial Number Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Serial Number</p>
                <p className="font-mono font-black text-slate-700 text-lg tracking-tight">{data.serial_number}</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase">วันที่ซื้อ</p>
                  <p className="font-bold text-slate-600 text-xs">{formatDateThai(data.purchase_date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-300 uppercase">วันหมดอายุ</p>
                  <p className={`font-black text-xs ${active?'text-emerald-600':'text-rose-500'}`}>
                    {formatDateThai(data.expiry_date)}
                  </p>
                </div>
              </div>

              {active && (
                <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl text-center text-[11px] font-bold border border-emerald-100">
                  ยินดีด้วย! ประกันเหลืออีก {daysLeft} วัน
                </div>
              )}

              {/* --- ส่วนที่เพิ่มใหม่: ข้อมูลลูกค้า & ร้านค้า --- */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                
                {/* ลูกค้า */}
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                     <User size={14} />
                   </div>
                   <div className="overflow-hidden">
                     <p className="text-[9px] font-bold text-slate-400 uppercase">ลูกค้า (Customer)</p>
                     <p className="text-xs font-bold text-slate-700 truncate">{data.customer_name || '-'}</p>
                   </div>
                </div>

                <div className="h-px bg-slate-200 w-full"></div>

                {/* ร้านค้า + ช่องทาง */}
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                     <Store size={14} />
                   </div>
                   <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase">ซื้อจาก (Store)</p>
                     <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-700">{data.store_name || '-'}</span>
                        {data.sales_channel && (
                          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            <ShoppingBag size={8} /> {data.sales_channel}
                          </span>
                        )}
                     </div>
                   </div>
                </div>

              </div>
              {/* --- จบส่วนที่เพิ่มใหม่ --- */}

            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
            <PhoneCall size={14} className="text-blue-500"/> Contact Support
          </h3>
          <div className="grid grid-cols-2 gap-2">
             <a href="https://line.me/R/ti/p/@pofpvc" className="flex justify-center items-center gap-2 bg-[#06C755] text-white py-2.5 rounded-xl text-[11px] font-bold hover:bg-[#05b54d] transition-colors">
               <ExternalLink size={14}/> @pofpvc
             </a>
             <a href="tel:0851622120" className="flex justify-center items-center gap-2 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-[11px] font-bold hover:bg-slate-200 transition-colors">
               <PhoneCall size={14}/> 085-162-2120
             </a>
          </div>
        </div>

      </div>

      {/* Scanner Overlay */}
      {scan && (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl w-full max-w-xs shadow-2xl">
            <h3 className="font-black text-slate-800 mb-4 text-center">Scan QR Code</h3>
            <div id="reader" className="rounded-2xl overflow-hidden border-4 border-slate-50 aspect-square shadow-inner"></div>
            <button onClick={()=>setScan(false)} className="w-full mt-6 p-3 bg-slate-100 text-slate-500 rounded-xl font-bold flex justify-center gap-2 hover:bg-rose-50 hover:text-rose-500 transition-colors">
              <X size={18}/> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}