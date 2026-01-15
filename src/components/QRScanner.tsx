"use client";
import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const [error, setError] = useState('');

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isOpen) {
      // เริ่มต้นกล้องเมื่อเปิด Modal
      const startScanner = async () => {
        try {
          // รอให้ UI render เสร็จก่อน 100ms
          await new Promise(r => setTimeout(r, 100));
          
          html5QrCode = new Html5Qrcode("global-reader");
          
          await html5QrCode.start(
            { facingMode: "environment" }, 
            {
              fps: 15,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              onScan(decodedText); // ส่งค่ากลับไปหน้าหลัก
              onClose(); // ปิดกล้องทันที
            },
            (errorMessage) => {
              // error ตอนสแกนไม่เจอ (ปกติ)
            }
          );
        } catch (err) {
          console.error("Camera Error:", err);
          setError("ไม่สามารถเปิดกล้องได้ (กรุณาอนุญาตสิทธิ์การใช้กล้อง)");
        }
      };
      startScanner();
    }

    // Cleanup function: ปิดกล้องเมื่อ Component ถูกทำลายหรือปิด Modal
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode?.clear()).catch(console.error);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-md p-4 flex justify-between items-center absolute top-0 w-full z-10">
        <h3 className="text-white font-bold flex items-center gap-2">
          <QrCode size={20} className="text-blue-400"/> สแกน QR Code
        </h3>
        <button onClick={onClose} className="bg-white/10 p-2 rounded-full text-white hover:bg-white/30 transition-all active:scale-95">
          <X size={24}/>
        </button>
      </div>

      {/* Camera Viewport */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
         <div id="global-reader" className="w-full h-full object-cover"></div>
         
         {/* เส้นกรอบเล็ง */}
         <div className="absolute w-[250px] h-[250px] border-2 border-white/40 rounded-3xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
           <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
           <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
           <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
           <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
           
           {/* เส้นสแกนวิ่งๆ */}
           <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_infinite]"></div>
         </div>

         {error && (
            <div className="absolute bottom-32 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm">
                {error}
            </div>
         )}

         <p className="absolute bottom-20 text-white/80 text-sm font-bold bg-black/40 px-6 py-3 rounded-full backdrop-blur-md">
           วาง QR Code ให้ตรงกรอบ
         </p>
      </div>
      
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          20% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}