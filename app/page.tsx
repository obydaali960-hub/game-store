'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function Home() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedGame, setSelectedGame] = useState('الكل');
  const [selectedPrice, setSelectedPrice] = useState('الكل');
  const [sortBy, setSortBy] = useState('lowest price');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [searchError, setSearchError] = useState(''); 
  
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب الحسابات من السحابة', error);
      } else if (data) {
        setListings(data);
      }
    };

    fetchListings();

    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(() => {
        const handleFirstInteraction = () => {
          if (audioRef.current) {
            audioRef.current.volume = 1.0;
            audioRef.current.play().catch(() => {});
          }
          window.removeEventListener('click', handleFirstInteraction);
        };
        window.addEventListener('click', handleFirstInteraction);
      });
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');

    if (!searchQuery.trim()) return;

    const cleanId = searchQuery.replace('#', '').trim();
    const foundItem = listings.find(item => String(item.id) === cleanId);

    if (foundItem) {
      router.push(`/account/${foundItem.id}`);
    } else {
      setSearchError('لم يتم العثور على حساب بهذا العنوان.');
    }
  };

  const filteredListings = listings.filter(item => {
    if (selectedGame !== 'الكل' && item.game !== selectedGame) return false;

    const price = Number(item.price);
    if (selectedPrice === 'low' && price >= 100) return false;
    if (selectedPrice === 'mid' && (price < 100 || price > 300)) return false;
    if (selectedPrice === 'high' && price <= 300) return false;

    return true;
  });

  const sortedAndFilteredListings = [...filteredListings].sort((a, b) => {
    const priceA = Number(a.price);
    const priceB = Number(b.price);

    if (sortBy === 'lowest price') {
      return priceA - priceB;
    } else if (sortBy === 'highest price') {
      return priceB - priceA;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      
      <audio ref={audioRef} src="/ambient.m4a" autoPlay loop preload="auto" />

      <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-4 gap-4 border-b border-gray-800/60 bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="شعار منصة NEXT LEVEL MAX" 
              className="w-10 h-10 object-contain rounded-xl border border-gray-800 shadow-md" 
            />
            <div className="text-xl md:text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              NEXT LEVEL MAX <span className="text-xs text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">PLATFORM</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          
          <button 
            onClick={toggleMute}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-4 py-2 rounded-full text-xs md:text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>{isMuted ? ' إلغاء الكتم' : ' كتم الصوت'}</span>
          </button>

          <form onSubmit={handleSearch} className="relative flex items-center w-full sm:w-72 md:w-80">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (searchError) setSearchError('');
              }}
              placeholder="ابحث بـ ID الطلب (6 أرقام)" 
              className="w-full bg-[#131b2e] border border-gray-800 rounded-full py-2 pl-20 pr-4 text-xs md:text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button 
              type="submit"
              className="absolute left-1 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shadow-md cursor-pointer"
            >
              بحث
            </button>
            {searchError && (
              <div className="absolute top-12 right-0 bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-50 whitespace-nowrap">
                {searchError}
              </div>
            )}
          </form>
          
          <Link href="/sell" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-4 py-2 rounded-full text-xs md:text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 shrink-0">
            <span>بيع حسابك</span>
          </Link>
        </div>
      </header>

      <section className="text-center py-6 md:py-8 px-4">
        <h1 className="text-2xl md:text-4xl font-extrabold mb-2 tracking-tight">استكشف أشهر الحسابات المعروضة</h1>
        <p className="text-gray-400 text-xs md:text-sm max-w-xl mx-auto">
          لتطلبه فوراً عبر رقم الطلب الآمن المكون من 6 أرقام. اختر لعبتك المفضلة وتصفح الحسابات المتاحة.
        </p>
      </section>

      <div className="py-4 px-4 bg-[#080c14] border-y border-gray-800/40">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-2 md:gap-3">
          {gamesList.map((gameName, index) => (
            <div 
              key={index}
              className="flex items-center justify-center gap-1.5 bg-[#131b2e] border border-gray-800/80 px-2 py-2 md:px-3 md:py-2.5 rounded-xl text-[10px] sm:text-xs md:text-sm font-semibold text-gray-300 shadow-sm text-center"
            >
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></div>
              <span className="truncate">{gameName}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <aside className="lg:col-span-1 bg-[#131b2e]/60 border border-gray-800/60 p-5 rounded-2xl h-fit backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-5 pb-3 border-b border-gray-800 text-cyan-400">فلترة و ترتيب</h3>
          
          <div className="mb-5">
            <label className="block text-xs text-gray-400 mb-2 font-medium">اللعبة</label>
            <select 
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="الكل">جميع الألعاب</option>
              {gamesList.map((g, idx) => (
                <option key={idx} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-xs text-gray-400 mb-2 font-medium">السعر</label>
            <select 
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="الكل">كل الأسعار</option>
              <option value="low">أقل من 100$</option>
              <option value="mid">100$ - 300$</option>
              <option value="high">أكثر من 300$</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium">الترتيب</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="lowest price">الأرخص أولاً</option>
              <option value="highest price">الأغلى أولاً</option>
            </select>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {sortedAndFilteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedAndFilteredListings.map((item: any) => (
                <div key={item.id} className="bg-[#131b2e]/80 border border-gray-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/50 transition-all group shadow-xl">
                  <div>
                    <div className="h-36 bg-[#0b0f19] rounded-xl mb-4 border border-gray-800/50 overflow-hidden flex items-center justify-center group-hover:border-cyan-500/20 transition-colors relative">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-600 font-medium text-sm">صورة الحساب</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-base text-gray-100 truncate max-w-[170px]">{item.title}</h4>
                      <span className="text-[11px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">ID: {item.id}</span>
                    </div>

                    <div className="text-xs text-gray-400 space-y-1 mb-4">
                      <p>المستوى: <span className="text-gray-200 font-semibold">{item.level}</span></p>
                      <p>التصنيف: <span className="text-gray-200 font-semibold">{item.rank}</span></p>
                      <p className="text-cyan-400/80 text-[11px] pt-1">اللعبة: {item.game}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-800/60 mt-auto">
                    <span className="text-lg font-black text-cyan-400">${item.price}</span>
                    <Link 
                      href={`/account/${item.id}`}
                      className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      ( التفاصيل )
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#131b2e]/40 border border-gray-800/60 rounded-2xl p-12 text-center text-gray-400">
              <p className="text-lg mb-2">لا توجد حسابات مطابقة للبحث أو الفلتر الحالي.</p>
              <Link href="/sell" className="text-cyan-400 text-sm font-semibold hover:underline">
                كن أول من يعرض حساباً!
              </Link>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}