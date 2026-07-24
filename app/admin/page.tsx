'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // كلمة المرور الخاصة بلوحة التحكم (يمكنك تغييرها هنا)
  const ADMIN_SECRET = 'Syr717&s1y@ro62'; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_SECRET) {
      setIsAuthenticated(true);
      fetchListings();
    } else {
      alert('كلمة المرور غير صحيحة!');
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('خطأ في جلب البيانات:', error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`هل أنت متأكد من حذف الحساب برقم الطلب #${id}؟`)) return;

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      alert('حدث خطأ أثناء الحذف: ' + error.message);
    } else {
      // إزالة الحساب من القائمة المحلية فوراً لتحديث الواجهة بدون الحاجة لإعادة تحميل الصفحة
      setListings((prev) => prev.filter((item) => item.id !== id));
      // إخبار التوجيه بتحديث البيانات من السيرفر
      router.refresh();
      alert('تم حذف الحساب بنجاح!');
    }
  };

  // تصفية الحسابات بناءً على البحث برقم الـ ID أو العنوان
  const filteredListings = listings.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      item.id.toString().toLowerCase().includes(query) ||
      item.title?.toLowerCase().includes(query) ||
      item.game?.toLowerCase().includes(query)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-4">
        <div className="bg-[#131b2e] border border-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <h1 className="text-2xl font-black mb-2 text-cyan-400">لوحة تحكم المشرف</h1>
          <p className="text-xs text-gray-400 mb-6">الرجاء إدخال رمز المرور السري للوصول</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="كلمة المرور..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-3 text-center text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              دخول لوحة التحكم
            </button>
          </form>
          <div className="mt-6">
            <Link href="/" className="text-xs text-gray-500 hover:text-cyan-400 transition-colors">
              ← العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans selection:bg-cyan-500 selection:text-black">
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-800/60 bg-[#0b0f19]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-cyan-400">لوحة التحكم</h1>
          <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
            المشرف الرئيسي
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">
            عرض الموقع ↗
          </Link>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            تسجيل خروج
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-[#131b2e]/60 border border-gray-800/60 p-6 rounded-3xl backdrop-blur-sm shadow-2xl space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-100">إدارة الحسابات المعروضة</h2>
              <p className="text-xs text-gray-400">ابحث برقم الـ ID (الست أرقام) أو عنوان الحساب لحذفه أو إدارته.</p>
            </div>
            
            <div className="w-full md:w-72">
              <input 
                type="text" 
                placeholder="ابحث برقم الطلب ID (مثال: 481920)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">جاري جلب البيانات...</div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-gray-800 rounded-2xl">
              لا توجد حسابات مطابقة للبحث.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-xs text-gray-400">
                    <th className="py-3 px-4 font-semibold">ID الطلب</th>
                    <th className="py-3 px-4 font-semibold">العنوان</th>
                    <th className="py-3 px-4 font-semibold">اللعبة</th>
                    <th className="py-3 px-4 font-semibold">السعر</th>
                    <th className="py-3 px-4 font-semibold text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-sm">
                  {filteredListings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">#{item.id}</td>
                      <td className="py-3.5 px-4 text-gray-200 font-medium">{item.title}</td>
                      <td className="py-3.5 px-4 text-gray-400 text-xs">{item.game}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-100">${item.price}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          حذف الحساب
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}