'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AccountDetailsPage() {
  const params = useParams();
  const id = params?.id;

  const [account, setAccount] = useState<any>(null);
  const [activeMedia, setActiveMedia] = useState<string>(''); 
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState<boolean>(false); // حالة معاينة الصورة كاملة

  useEffect(() => {
    const defaultListings = [
      { id: 101, title: 'حساب فالورانت أسطوري', game: 'Counter-Strike 2 (CS2)', level: '150', rank: 'Immortal', price: 250, description: 'حساب قوي جداً وسكنات نادرة.', contactLink: 'hidden', images: [], videoUrl: '' },
      { id: 102, title: 'حساب ببجي عريق ومثكس', game: 'PUBG Mobile', level: '75', rank: 'Conqueror', price: 180, description: 'مفول سيزونات قديمة.', contactLink: 'hidden', images: [], videoUrl: '' },
      { id: 103, title: 'حساب فورتنايت ندرز', game: 'Fortnite', level: '220', rank: 'Champion', price: 320, description: 'سكنات حصرية.', contactLink: 'hidden', images: [], videoUrl: '' },
      { id: 104, title: 'كلاش أوف كلانس قري توفل 16', game: 'Clash of Clans', level: '240', rank: 'Legends', price: 150, description: 'بيس ماكس بالكامل.', contactLink: 'hidden', images: [], videoUrl: '' },
    ];

    const savedListings = JSON.parse(localStorage.getItem('userListings') || '[]');
    const allListings = [...savedListings, ...defaultListings];

    const found = allListings.find((item: any) => String(item.id) === String(id));
    if (found) {
      setAccount(found);
      if (found.images && found.images.length > 0) {
        setActiveMedia(found.images[0]);
      }
    }
  }, [id]);

  if (!account) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center">
        <p className="text-xl text-gray-400 mb-4">عذراً، لم يتم العثور على تفاصيل هذا الحساب.</p>
        <Link href="/" className="text-cyan-400 hover:underline">العودة للرئيسية ←</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans selection:bg-cyan-500 selection:text-black">
      
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-800/60 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          GAME STORE <span className="text-xs text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">MENA</span>
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
          العودة للرئيسية ←
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-[#131b2e]/60 border border-gray-800/60 p-8 rounded-3xl backdrop-blur-sm shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            {/* الشاشة الكبرى لعرض الصورة مع زر العرض الكامل في الزاوية */}
            <div className="relative h-80 bg-[#0b0f19] rounded-2xl border border-gray-800/85 flex items-center justify-center overflow-hidden shadow-inner group">
              {activeMedia ? (
                <>
                  <img src={activeMedia} alt={account.title} className="w-full h-full object-cover" />
                  
                  {/* زر التكبير / العرض الكامل في الزاوية المحددة */}
                  <button 
                    onClick={() => setIsFullScreenOpen(true)}
                    className="absolute top-3 left-3 bg-[#0b0f19]/80 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/40 px-2.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md transition-all shadow-md flex items-center gap-1.5"
                    title="عرض الصورة بشكل كامل"
                  >
                    <span>🔍</span>
                    <span>تكبير</span>
                  </button>
                </>
              ) : (
                <span className="text-gray-500 font-medium text-sm">لا توجد صور مرفقة لهذا الحساب</span>
              )}
            </div>

            {account.images && account.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {account.images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveMedia(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeMedia === img ? 'border-cyan-400 scale-105' : 'border-gray-800 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {account.videoUrl && (
              <div className="pt-2">
                <h3 className="text-xs font-bold text-cyan-400 mb-2">مقطع فيديو توضيحي للحساب:</h3>
                <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#0b0f19] p-2">
                  <a 
                    href={account.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between bg-[#131b2e] hover:bg-[#1a2540] px-4 py-3 rounded-lg border border-gray-800 text-xs text-cyan-300 transition-all"
                  >
                    <span className="truncate">▶️ تشغيل مقطع الفيديو المباشر من الإنترنت</span>
                    <span className="text-[10px] text-gray-400 underline">فتح الرابط</span>
                  </a>
                </div>
              </div>
            )}

            <p className="text-[11px] text-gray-400 text-center">تم التحقق من محتوى الحساب ومطابقته للمواصفات المعروضة.</p>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-full font-semibold">
                  {account.game}
                </span>
                <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full font-mono border border-gray-700">
                  ID الطلب: #{account.id}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-gray-100">{account.title}</h1>
              
              <div className="space-y-3 text-sm text-gray-300 border-y border-gray-800 py-4 my-4">
                <p className="flex justify-between">
                  <span className="text-gray-400">المستوى (Level):</span>
                  <span className="font-bold text-gray-100">{account.level}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">التصنيف (Rank):</span>
                  <span className="font-bold text-gray-100">{account.rank}</span>
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 mb-1">وصف الحساب:</h3>
                <p className="text-sm text-gray-300 leading-relaxed bg-[#0b0f19]/60 p-3 rounded-xl border border-gray-800/60">
                  {account.description || 'لا توجد تفاصيل إضافية مسجلة.'}
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">السعر المطلوب</span>
                <span className="text-2xl font-black text-cyan-400">${account.price}</span>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
              >
                شراء الحساب الآن
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* نافذة معاينة الصورة بالكامل (Full Screen Image Modal) */}
      {isFullScreenOpen && activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              onClick={() => setIsFullScreenOpen(false)}
              className="absolute -top-12 left-0 text-gray-300 hover:text-white text-sm font-bold bg-[#131b2e] border border-gray-700 px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-lg"
            >
              <span>إغلاق العرض</span>
              <span>✕</span>
            </button>
            <img 
              src={activeMedia} 
              alt="Full View" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-cyan-500/30 shadow-2xl" 
            />
          </div>
        </div>
      )}

      {/* نافذة الحوار المنبثقة لشراء الحساب */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f19]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          
          <div className="relative p-[2px] rounded-[30px] bg-gradient-to-r from-blue-500 to-cyan-400 shadow-2xl max-w-lg w-full">
            
            <div className="bg-[#131b2e] rounded-[28px] p-6 md:p-8 relative text-right" dir="rtl">
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 left-5 text-gray-400 hover:text-white text-sm font-bold bg-[#0b0f19] border border-gray-800 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              >
                ✕
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                  <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 text-lg font-bold flex-shrink-0">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">تعليمات إتمام طلب الشراء</h3>
                    <p className="text-xs text-cyan-400 font-mono mt-0.5">رقم الطلب (ID): #{account.id}</p>
                  </div>
                </div>
                
                <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gray-800/80 shadow-inner">
                  <p className="text-base md:text-lg text-gray-100 leading-relaxed font-semibold">
                    يرجى أخذ لقطة شاشة لعنوان الطلب (ID الطلب) من أجل تقديمه أثناء طلبك للحساب الذي تود شرائه من أجل إرسالها للمشرف كي نتمكن من معرفة الطلب الذي تقصده.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="p-[1px] rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400">
                  <a 
                    href="https://t.me/obyda_1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full text-center bg-[#131b2e] hover:bg-cyan-500 hover:text-black text-cyan-400 font-bold py-3.5 rounded-xl text-sm transition-all"
                  >
                    تواصل عبر تيليجرام
                  </a>
                </div>

                <div className="p-[1px] rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400">
                  <a 
                    href={`https://wa.me/?text=مرحباً، أود شراء الحساب برقم الطلب ID: %23${account.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full text-center bg-[#131b2e] hover:bg-emerald-600 hover:text-white text-emerald-400 font-bold py-3.5 rounded-xl text-sm transition-all"
                  >
                    تواصل عبر واتساب
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}