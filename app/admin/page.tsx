'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const gamesList = [
  'PUBG Mobile',
  'Fortnite',
  'Counter-Strike 2 (CS2)',
  'Call of Duty',
  'Clash of Clans',
  'League of Legends',
  'Roblox',
  'Free Fire'
];

export default function AdminDashboard() {
  const ADMIN_PASSWORD = 'Syr717&s1y@ro62'; 
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [listings, setListings] = useState<any[]>([]);
  const [selectedStatGame, setSelectedStatGame] = useState('الكل');
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);

  const [editingItem, setEditingItem] = useState<any | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadListings();
    }
  }, [isAuthenticated]);

  const loadListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('خطأ في جلب البيانات من السحابة', error);
    } else if (data) {
      setListings(data);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('كلمة المرور غير صحيحة!');
    }
  };

  const filteredForStats = selectedStatGame === 'الكل' 
    ? listings 
    : listings.filter(item => item.game === selectedStatGame);

  const totalCount = filteredForStats.length;
  const totalPrice = filteredForStats.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const handleDeleteGameListings = async (gameName: string) => {
    if (gameName === 'الكل') {
      if (confirm('تحذير شديد: هل أنت متأكد من حذف جميع حسابات المنصة بالكامل من السحابة؟')) {
        const { error } = await supabase.from('listings').delete().neq('id', 0);
        if (error) {
          alert('حدث خطأ أثناء الحذف: ' + error.message);
        } else {
          setListings([]);
          setSearchResult(null);
          alert('تم حذف جميع الحسابات بنجاح.');
        }
      }
    } else {
      if (confirm(`هل أنت متأكد من حذف جميع حسابات لعبة (${gameName}) نهائياً من السحابة؟`)) {
        const { error } = await supabase.from('listings').delete().eq('game', gameName);
        if (error) {
          alert('حدث خطأ أثناء الحذف: ' + error.message);
        } else {
          loadListings();
          setSearchResult(null);
          alert(`تم حذف حسابات ${gameName} بنجاح.`);
        }
      }
    }
  };

  const handleSearchAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchNotFound(false);
    setSearchResult(null);

    if (!searchId.trim()) return;

    const cleanId = searchId.replace('#', '').trim();
    const found = listings.find(item => String(item.id) === cleanId);

    if (found) {
      setSearchResult(found);
    } else {
      setSearchNotFound(true);
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب نهائياً من المنصة؟')) {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) {
        alert('حدث خطأ أثناء الحذف: ' + error.message);
      } else {
        loadListings();
        if (searchResult && searchResult.id === id) {
          setSearchResult(null);
        }
        alert('تم حذف الحساب بنجاح.');
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { error } = await supabase
      .from('listings')
      .update({
        title: editingItem.title,
        price: Number(editingItem.price),
        level: editingItem.level,
        rank: editingItem.rank,
        contact_link: editingItem.contact_link || editingItem.contactLink,
      })
      .eq('id', editingItem.id);

    if (error) {
      alert('حدث خطأ أثناء التعديل: ' + error.message);
    } else {
      loadListings();
      if (searchResult && searchResult.id === editingItem.id) {
        setSearchResult(editingItem);
      }
      setEditingItem(null);
      alert('تم تعديل الحساب بنجاح!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-4">
        <div className="bg-[#131b2e] border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <h1 className="text-2xl font-black text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            لوحة تحكم المشرفين
          </h1>
          <p className="text-gray-400 text-xs text-center mb-6">الرجاء إدخال كلمة المرور السرية للوصول</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="كلمة المرور السرية..."
                className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 text-center tracking-widest"
              />
            </div>
            {errorMsg && (
              <p className="text-red-500 text-xs text-center font-bold">{errorMsg}</p>
            )}
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 text-sm cursor-pointer"
            >
              دخول اللوحة
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">
              العودة إلى الصفحة الرئيسية للمنصة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans p-4 md:p-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-cyan-400">لوحة التحكم المركزية</h1>
          <p className="text-xs text-gray-400">إدارة حسابات المنصة، الإحصائيات، وأدوات المشرفين (سحابياً)</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-[#131b2e] border border-gray-800 hover:border-cyan-500/50 text-xs font-semibold px-4 py-2 rounded-xl transition-all">
            عرض المنصة
          </Link>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            تسجيل خروج
          </button>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h2 className="text-lg font-bold text-gray-200">📊 إحصائيات المنصة</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">تصفية حسب اللعبة:</span>
              <select 
                value={selectedStatGame}
                onChange={(e) => setSelectedStatGame(e.target.value)}
                className="bg-[#131b2e] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="الكل">كل الألعاب</option>
                {gamesList.map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => handleDeleteGameListings(selectedStatGame)}
              className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              {selectedStatGame === 'الكل' ? '🗑️ حذف كل حسابات المنصة' : `🗑️ حذف حسابات ${selectedStatGame}`}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#131b2e]/85 border border-gray-800/80 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">إجمالي الحسابات المعروضة ({selectedStatGame})</p>
              <h3 className="text-3xl font-black text-cyan-400">{totalCount} <span className="text-xs font-normal text-gray-400">حساب</span></h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl font-bold">
              🎮
            </div>
          </div>

          <div className="bg-[#131b2e]/85 border border-gray-800/80 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">إجمالي قيمة الحسابات ({selectedStatGame})</p>
              <h3 className="text-3xl font-black text-cyan-400">${totalPrice}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl font-bold">
              💰
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#131b2e]/40 border border-gray-800/60 p-6 rounded-2xl backdrop-blur-sm">
        <h2 className="text-lg font-bold text-gray-200 mb-4">🔍 إدارة وحذف حساب محدد (بواسطة الـ ID المكون من 6 أرقام)</h2>
        
        <form onSubmit={handleSearchAdmin} className="flex gap-3 max-w-xl mb-6">
          <input 
            type="text" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="أدخل ID الطلب (6 أرقام)..."
            className="flex-1 bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
          />
          <button 
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shrink-0 cursor-pointer"
          >
            بحث عن الحساب
          </button>
        </form>

        {searchNotFound && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-4">
            لم يتم العثور على أي حساب بهذا الـ ID. تأكد من الرقم المدخل.
          </div>
        )}

        {searchResult && (
          <div className="max-w-sm mx-auto md:mx-0">
            <p className="text-xs text-cyan-400 font-semibold mb-2">نتيجة البحث:</p>
            <div className="bg-[#131b2e]/90 border border-cyan-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="h-36 bg-[#0b0f19] rounded-xl mb-4 border border-gray-800/50 overflow-hidden flex items-center justify-center relative">
                  {searchResult.images && searchResult.images.length > 0 ? (
                    <img src={searchResult.images[0]} alt={searchResult.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-600 font-medium text-sm">صورة الحساب</span>
                  )}
                </div>

                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-base text-gray-100">{searchResult.title}</h4>
                  <span className="text-[11px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">ID: {searchResult.id}</span>
                </div>

                <div className="text-xs text-gray-400 space-y-1 mb-4">
                  <p>المستوى: <span className="text-gray-200 font-semibold">{searchResult.level}</span></p>
                  <p>التصنيف: <span className="text-gray-200 font-semibold">{searchResult.rank}</span></p>
                  <p className="text-cyan-400/80 text-[11px] pt-1">اللعبة: {searchResult.game}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800/60 mt-auto flex items-center justify-between gap-1">
                
                <button 
                  onClick={() => handleDelete(searchResult.id)}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  حذف
                </button>

                {(() => {
                  const sellerLink = searchResult.contact_link || searchResult.contactLink;
                  if (sellerLink) {
                    const finalUrl = sellerLink.startsWith('http') ? sellerLink : `https://${sellerLink}`;
                    return (
                      <a 
                        href={finalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black text-[11px] font-bold px-3 py-2 rounded-xl transition-all text-center"
                      >
                        التواصل
                      </a>
                    );
                  } else {
                    return <span className="text-[10px] text-gray-500">لا يوجد رابط</span>;
                  }
                })()}

                <button 
                  onClick={() => setEditingItem(searchResult)}
                  className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black text-[11px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  تعديل
                </button>

              </div>
            </div>
          </div>
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-gray-800 w-full max-w-lg p-6 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">تعديل تفاصيل الحساب (ID: {editingItem.id})</h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">عنوان الحساب</label>
                <input 
                  type="text" 
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">السعر ($)</label>
                  <input 
                    type="number" 
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">المستوى</label>
                  <input 
                    type="text" 
                    value={editingItem.level}
                    onChange={(e) => setEditingItem({...editingItem, level: e.target.value})}
                    className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">التصنيف أو الرانك</label>
                <input 
                  type="text" 
                  value={editingItem.rank}
                  onChange={(e) => setEditingItem({...editingItem, rank: e.target.value})}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">رابط التواصل مع البائع</label>
                <input 
                  type="text" 
                  value={editingItem.contact_link || editingItem.contactLink || ''}
                  onChange={(e) => setEditingItem({...editingItem, contact_link: e.target.value})}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button 
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-5 py-2 rounded-xl transition-all cursor-pointer shadow-lg"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}