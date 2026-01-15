"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Search, QrCode, ShieldCheck, Package, PhoneCall, ExternalLink, X, 
  User, Store, ShoppingBag, ShieldAlert, Info 
} from 'lucide-react';
import { format, parseISO, isAfter, differenceInDays } from 'date-fns';
import { useSearchParams } from 'next/navigation';

// ฟังก์ชันดึงค่าจาก URL (?sn=...)
function SearchHandler({ onSearch }: { onSearch: (sn: string) => void }) {
  const s = useSearchParams();
  useEffect(() => { 
    const snParam = s.get('sn');
    if(snParam) onSearch(snParam);
  }, [s, onSearch]);
  return null;
}

// ฟังก์ชันแปลงวันที่ไทย
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
    setLoading(true); 
    setError(''); 
    setData(null); 
    setSn(val);
    
    const { data: res, error: err } = await supabase
      .from('warranties')
      .select('*') 
      .eq('serial_number', val.trim())
      .single();

    if(res) {
      setData(res);
    } else {
      setError('ไม่พบข้อมูล Serial Number นี้ในระบบ');
    }
    setLoading(false);
  };

  // ฟังก์ชันเริ่มสแกนที่เสถียรขึ้น
  const startScan = () => {
    setScan(true);
    // รอให้ Modal และ div#reader ปรากฏบน DOM ก่อน 500ms
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          "reader", 
          { 
            fps: 15, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            videoConstraints: { facingMode: "environment" } // บังคับใช้กล้องหลัง
          }, 
          false
        );

        scanner.render(
          (txt) => { 
            handleSearch(txt); 
            setScan(false); 
            scanner.clear(); // ล้างตัวสแกนเมื่อได้ข้อมูล
          }, 
          (err) => { 
            // ปล่อยให้มันลองสแกนต่อไปเรื่อยๆ ไม่ต้องเด้ง Error
          }
        );
      } catch (err) {
        console.error("Scanner Error:", err);
      }
    }, 600);
  };

  const active = data ? isAfter(parseISO(data.expiry_date), new Date()) : false;
  const daysLeft = data ? differenceInDays(parseISO(data.expiry_date), new Date()) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans text-slate-900 pb-12">
      <Suspense fallback={null}>
        <SearchHandler onSearch={handleSearch}/>
      </Suspense>
      
      <div className="max-w-sm w-full space-y-5 py-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="text-white" size={24}/>
          </div>
          <h1 className="text-xl font-black text-slate-800">Check Warranty</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Plasticbag 2015 System</p>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="กรอก Serial Number..." 
            className="w-full p-4 pl-11 bg-white rounded-xl shadow-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            value={sn} 
            onChange={e=>setSn(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSearch(sn)}
          />
          <Search className="absolute left-3.5 top-4 text-slate-300" size={20}/>
          <button 
            onClick={startScan} 
            className="absolute right-2 top-2 p-2 bg-slate-50 text-slate-500 rounded-lg active:scale-90 transition-all hover:bg-blue-50 hover:text-blue-600"
          >
            <QrCode size={20}/>
          </button>
        </div>
        
        <button 
          onClick={()=>handleSearch(sn)} 
          disabled={loading} 
          className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold shadow-md hover:bg-slate-800 active:scale-[0.98] transition-all disabled:bg-slate-300"
        >
          {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะ'}
        </button>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <ShieldAlert size={20}/>
            <p className="font-bold text-xs">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {data && (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
            
            {/* สถานะ Active / Expired */}
            <div className={`py-3 px-5 flex justify-between items-center ${active?'bg-emerald-500':'bg-rose-500'}`}>
               <span className="text-white text-[10px] font-black uppercase tracking-wider">Status</span>
               <div className="flex items-center gap-2">
                 <span className="text-white text-xs font-bold">{active?'คุ้มครองปกติ':'หมดประกันแล้ว'}</span>
                 <div className="bg-white/20 p-1 rounded-full"><ShieldCheck size={14} className="text-white"/></div>
               </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* ข้อมูลสินค้าเบื้องต้น */}
              <div className="flex gap-4 items-start border-b border-slate-50 pb-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                  <Package size={28}/>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">Product Info</p>
                  <h3 className="font-black text-slate-800 text-base leading-tight">{data.product_name}</h3>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block uppercase">
                    {data.model || '-'}
                  </span>
                </div>
              </div>

              {/* ส่วนสำคัญ: SN และเงื่อนไขสีแดง */}
              <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 text-center space-y-4 shadow-inner">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Serial Number</p>
                  <p className="font-mono font-black text-slate-700 text-2xl tracking-tight">{data.serial_number}</p>
                </div>

                <div className="h-px bg-slate-200 w-full mx-auto"></div>

                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center justify-center gap-1 text-center">
                    <Info size={12} className="text-blue-500"/> เงื่อนไขการรับประกัน
                  </p>
                  <p className="text-sm font-bold text-slate-700 leading-snug px-2">
                    {data.warranty_condition || 'การรับประกันครอบคลุมเฉพาะตัวเครื่อง ไม่รวมอุปกรณ์เสริม'}
                  </p>
                </div>

                {/* ข้อความสีแดง ตัวใหญ่ อ่านชัดเจน */}
                <div className="bg-white border-2 border-rose-100 p-3 rounded-xl shadow-sm">
                   <p className="text-sm md:text-base font-black text-rose-600 leading-tight uppercase">
                     *** เงื่อนไขการรับประกันเป็นไปตามพิจารณาของทางร้าน ***
                   </p>
                </div>
              </div>

              {/* วันที่ซื้อและวันหมดอายุ */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 px-1">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">วันที่ซื้อ</p>
                  <p className="font-bold text-slate-700 text-xs">{formatDateThai(data.purchase_date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">วันหมดอายุ</p>
                  <p className={`font-black text-xs ${active?'text-emerald-600':'text-rose-500'}`}>
                    {formatDateThai(data.expiry_date)}
                  </p>
                </div>
              </div>

              {active && (
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-center text-[11px] font-bold border border-emerald-100 animate-pulse">
                  ยินดีด้วย! ประกันเหลืออีก {daysLeft} วัน
                </div>
              )}

              {/* ข้อมูลลูกค้าและร้านค้า */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                     <User size={16} />
                   </div>
                   <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase">ลูกค้า (Customer)</p>
                     <p className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{data.customer_name || '-'}</p>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                     <Store size={16} />
                   </div>
                   <div className="flex-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase">ซื้อจาก (Store)</p>
                     <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-700">{data.store_name || '-'}</span>
                        {data.sales_channel && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase">
                            <ShoppingBag size={10} /> {data.sales_channel}
                          </span>
                        )}
                     </div>
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ปุ่มติดต่อ Support */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-[10px] font-black text-slate-800 uppercase flex items-center gap-2 tracking-widest">
            <PhoneCall size={14} className="text-blue-500"/> Contact Support
          </h3>
          <div className="grid grid-cols-2 gap-2">
             <a href="https://line.me/R/ti/p/@pofpvc" className="flex justify-center items-center gap-2 bg-[#06C755] text-white py-3 rounded-xl text-[11px] font-bold active:scale-95 transition-all">
               <ExternalLink size={14}/> @pofpvc
             </a>
             <a href="tel:0851622120" className="flex justify-center items-center gap-2 bg-slate-100 text-slate-600 py-3 rounded-xl text-[11px] font-bold active:scale-95 transition-all">
               <PhoneCall size={14}/> 085-162-2120
             </a>
          </div>
        </div>

      </div>

      {/* สแกนเนอร์ Overlay (ปรับปรุง UI) */}
      {scan && (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-[2.5rem] w-full max-w-xs shadow-2xl overflow-hidden relative">
            <h3 className="font-black text-slate-800 mb-4 text-center text-lg flex items-center justify-center gap-2">
              <QrCode className="text-blue-600" size={20}/> สแกน QR Code
            </h3>
            
            {/* พื้นที่สำหรับกล้อง */}
            <div id="reader" className="rounded-2xl overflow-hidden border-4 border-slate-50 aspect-square shadow-inner bg-slate-50"></div>
            
            <p className="text-[10px] text-slate-400 text-center mt-4 font-bold uppercase tracking-wider">
              จัดวาง QR Code ให้อยู่ในกรอบ
            </p>

            <button 
              onClick={()=> {
                setScan(false);
                // ต้องล้างสถานะกล้องในเครื่องด้วยเมื่อกดปิด
                window.location.reload(); 
              }} 
              className="w-full mt-6 p-4 bg-slate-100 text-slate-500 rounded-2xl font-black flex justify-center gap-2 active:scale-95 transition-all hover:bg-rose-50 hover:text-rose-500"
            >
              <X size={18}/> ยกเลิกการสแกน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}