"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Package, ShieldCheck, AlertCircle, Search, Printer, Plus, 
  TrendingUp, LogOut, Trash2, Edit, User, Store, Clock, ShoppingBag,
  ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ฟังก์ชันแปลงวันที่ไทย
const formatDateThai = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
};

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expiring: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  // Reset หน้าเป็น 1 เมื่อค้นหา
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchData = async () => {
    const { data: warranties } = await supabase
      .from('warranties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (warranties) {
      setData(warranties);
      
      const now = new Date();
      const active = warranties.filter(w => new Date(w.expiry_date) > now).length;
      const expiring = warranties.filter(w => {
        const days = differenceInDays(new Date(w.expiry_date), now);
        return days > 0 && days <= 30;
      }).length;
      setStats({ total: warranties.length, active, expiring });

      // Mock Data สำหรับกราฟ (ปรับแต่งได้ตามจริง)
      setChartData([
        { name: 'ต.ค.', sales: 12 }, { name: 'พ.ย.', sales: 19 },
        { name: 'ธ.ค.', sales: 30 }, { name: 'ม.ค.', sales: 45 },
        { name: 'ก.พ.', sales: 28 }, { name: 'มี.ค.', sales: warranties.length }
      ]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDelete = async (id: number) => {
    if (confirm('⚠️ ยืนยันการลบข้อมูลนี้?')) {
      const { error } = await supabase.from('warranties').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const handlePrint = (item: any) => {
    const checkUrl = `${window.location.origin}/check?sn=${item.serial_number}`;
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <style>
            @page { size: 40mm 20mm; margin: 0; }
            body { margin: 0; padding: 0; font-family: sans-serif; overflow: hidden; }
            .label { width: 40mm; height: 20mm; display: flex; align-items: center; padding: 1mm; box-sizing: border-box; }
            .qr { width: 13mm; display: flex; justify-content: center; }
            .info { flex: 1; padding-left: 1mm; line-height: 1; overflow: hidden; }
            .title { font-size: 7px; font-weight: bold; white-space: nowrap; }
            .model { font-size: 6px; font-weight: bold; color: #000; margin-top: 1px; }
            .sn { font-size: 6px; font-family: monospace; margin-top: 1px; }
            .date { font-size: 5px; font-weight: bold; margin-top: 1px; color: #333; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="qr" id="qrcode"></div>
            <div class="info">
              <div class="title">${item.product_name}</div>
              <div class="model">${item.model || '-'}</div>
              <div class="sn">SN:${item.serial_number}</div>
              <div class="date">EXP:${format(parseISO(item.expiry_date), 'dd/MM/yy')}</div>
            </div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js"></script>
          <script>
            QRCode.toCanvas(document.createElement('canvas'), '${checkUrl}', { width: 50, margin: 0 }, function (error, canvas) {
              document.getElementById('qrcode').appendChild(canvas);
              setTimeout(() => { window.print(); window.close(); }, 500);
            })
          </script>
        </body>
        </html>
      `);
    }
  };

  // Logic การค้นหาและแบ่งหน้า
  const filteredData = data.filter(item => 
    item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sales_channel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">W</div>
          <span className="font-bold text-lg text-slate-800">Warranty Admin</span>
        </div>
        
        <div className="flex items-center gap-2">
            {/* ปุ่ม Settings */}
            <Link href="/admin/settings" className="text-slate-500 hover:text-blue-600 font-bold text-sm flex items-center gap-2 bg-slate-50 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">
                <Settings size={18} /> <span className="hidden md:inline">Settings</span>
            </Link>

            {/* ปุ่ม Logout */}
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 font-bold text-sm flex items-center gap-2 bg-slate-50 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                <LogOut size={18} /> <span className="hidden md:inline">Logout</span>
            </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-500 text-sm mt-1">จัดการข้อมูลการรับประกันสินค้า</p>
          </div>
          <Link href="/admin/add" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95">
             <Plus size={18} /> เพิ่มรายการใหม่
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Orders" value={stats.total} icon={<Package size={20} />} color="bg-blue-500" />
          <StatCard title="Active" value={stats.active} icon={<ShieldCheck size={20} />} color="bg-emerald-500" />
          <StatCard title="Expiring (30 Days)" value={stats.expiring} icon={<AlertCircle size={20} />} color="bg-orange-500" />
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hidden md:block">
          <h3 className="font-bold text-slate-800 mb-6 flex gap-2"><TrendingUp size={20} className="text-blue-500"/> Growth Stats</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}}/>
                <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          
          {/* Table Header & Search */}
          <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-slate-400"/> Recent Orders</h3>
            <div className="relative w-full md:w-72">
              <input type="text" placeholder="ค้นหา S/N, ลูกค้า, ช่องทาง..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">สินค้า / รุ่น (S/N)</th>
                  <th className="px-6 py-4">ลูกค้า / ช่องทาง</th>
                  <th className="px-6 py-4">วันที่ซื้อ / หมดอายุ</th>
                  <th className="px-6 py-4">สถานะประกัน</th>
                  <th className="px-6 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {currentItems.map((item) => {
                  const isActive = new Date(item.expiry_date) > new Date();
                  const daysLeft = differenceInDays(new Date(item.expiry_date), new Date());
                  
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-slate-800">{item.product_name}</div>
                        <div className="text-xs text-blue-600 font-bold mt-0.5">{item.model || '-'}</div>
                        <div className="text-[10px] text-slate-400 font-mono bg-slate-100 inline-block px-1.5 rounded mt-1">{item.serial_number}</div>
                      </td>
                      <td className="px-6 py-4 align-top space-y-2">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400"/> 
                          <span className="font-bold text-slate-700">{item.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Store size={12}/> {item.store_name || '-'}
                        </div>
                        {item.sales_channel && (
                          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <ShoppingBag size={10} /> {item.sales_channel}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                           <span className="w-12">ซื้อ:</span> 
                           <span className="font-mono font-bold">{formatDateThai(item.purchase_date)}</span>
                        </div>
                        <div className={`text-xs font-bold flex items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-rose-500'}`}>
                           <span className="w-12">หมด:</span>
                           <span className="font-mono">{formatDateThai(item.expiry_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                         <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                            {isActive ? 'Active' : 'Expired'}
                         </div>
                         {isActive && (
                           <div className="text-[10px] font-bold text-slate-400 mt-2 pl-1">
                             เหลืออีก {daysLeft} วัน
                           </div>
                         )}
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handlePrint(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="พิมพ์สติกเกอร์">
                            <Printer size={18} />
                          </button>
                          <Link href={`/admin/edit/${item.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="แก้ไข">
                            <Edit size={18} />
                          </Link>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="ลบ">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredData.length === 0 && <div className="p-10 text-center text-slate-400"><Package size={48} className="mx-auto mb-3 opacity-20"/><p>ไม่พบข้อมูลที่ค้นหา</p></div>}
          </div>

          {/* Pagination Controls */}
          {filteredData.length > 0 && (
            <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
              <p className="text-xs text-slate-500 font-bold">
                แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredData.length)} จากทั้งหมด {filteredData.length} รายการ
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1 px-2">
                  <span className="text-sm font-bold text-slate-700">{currentPage}</span>
                  <span className="text-xs text-slate-400">/</span>
                  <span className="text-sm font-bold text-slate-400">{totalPages}</span>
                </div>

                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Sub Component: Card
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-start">
      <div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p><h3 className="text-3xl font-black text-slate-800">{value}</h3></div>
      <div className={`p-3 rounded-xl text-white shadow-lg shadow-blue-100 ${color}`}>{icon}</div>
    </div>
  );
}