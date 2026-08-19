'use client';

import { useState } from 'react';
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

export default function SellPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    game: gamesList[0],
    level: '',
    rank: '',
    price: '',
    contactLink: '',
    description: ''
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return resolve(file); 
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((height * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.75 
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedImageUrls: string[] = [];

      for (const file of selectedFiles) {
        const processedFile = await compressImage(file);

        const fileExt = processedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('game-store-media')
          .upload(filePath, processedFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('game-store-media')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          uploadedImageUrls.push(publicUrlData.publicUrl);
        }
      }

      // توليد رقم ID عشوائي فريد مكون من 6 منازل
      const randomSixDigitId = Math.floor(100000 + Math.random() * 900000);

      const { error: dbError } = await supabase.from('listings').insert([
        {
          id: randomSixDigitId,
          title: formData.title,
          game: formData.game,
          level: formData.level,
          rank: formData.rank,
          price: Number(formData.price),
          contact_link: formData.contactLink,
          description: formData.description,
          images: uploadedImageUrls,
        }
      ]);

      if (dbError) {
        throw dbError;
      }

      // عرض رقم الطلب الفعلي للمستخدم في رسالة النجاح
      alert(`تم بنجاح نشر الإعلان!\nرقم طلبك الفريد هو: ${randomSixDigitId}\nيرجى الاحتفاظ به أو أخذ لقطة شاشة.`);
      router.push('/');
    } catch (error: any) {
      console.error(error);
      alert('حدث خطأ أثناء النشر: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans selection:bg-cyan-500 selection:text-black">
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-800/60 bg-[#0b0f19]/85 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          GAME STORE <span className="text-xs text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">GLOBAL</span>
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
          العودة للرئيسية ←
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#131b2e]/60 border border-gray-800/60 p-8 rounded-3xl backdrop-blur-sm shadow-2xl">
          <h1 className="text-2xl font-extrabold mb-2 text-cyan-400">عرض حساب للبيع</h1>
          <p className="text-gray-400 text-sm mb-8">سيتم توليد رقم طلب (ID) فريد ومكون من 6 أرقام لهذا الحساب تلقائياً عند النشر.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium">عنوان الإعلان</label>
              <input 
                type="text" 
                required
                placeholder="مثال: حساب نادر" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium">اللعبة</label>
              <select 
                value={formData.game}
                onChange={(e) => setFormData({...formData, game: e.target.value})}
                className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
              >
                {gamesList.map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium">المستوى (Level)</label>
                <input 
                  type="text" 
                  required
                  placeholder="مثال: 75" 
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium">التصنيف أو الرانك (Rank)</label>
                <input 
                  type="text" 
                  required
                  placeholder="مثال: Conqueror" 
                  value={formData.rank}
                  onChange={(e) => setFormData({...formData, rank: e.target.value})}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium">السعر ($)</label>
                <input 
                  type="number" 
                  required
                  placeholder="مثال: 150" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-cyan-400 mb-2 font-semibold">
                  رابط التواصل الخاص <span className="text-[10px] text-gray-400 font-normal">(للبائع)</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="رابط واتساب أو تيليجرام" 
                  value={formData.contactLink}
                  onChange={(e) => setFormData({...formData, contactLink: e.target.value})}
                  className="w-full bg-[#0b0f19] border border-cyan-500/50 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 font-medium">تفاصيل إضافية عن الحساب</label>
              <textarea 
                rows={3}
                placeholder="اكتب تفاصيل الإنجازات..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 resize-none"
              ></textarea>
            </div>

            <div className="bg-[#0b0f19]/40 border border-gray-800 p-4 rounded-2xl space-y-3">
              <label className="block text-xs text-cyan-400 font-semibold">صور أو مقاطع الحساب</label>
              <input 
                type="file" 
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl p-2.5 text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/15 file:text-cyan-400 hover:file:bg-cyan-500/25 cursor-pointer"
              />

              {selectedFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] text-gray-400">الملفات المختارة ({selectedFiles.length}):</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-[#131b2e] px-3 py-2 rounded-xl border border-gray-800 text-xs">
                        <span className="truncate max-w-[280px] text-gray-300">{file.name}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-400 hover:text-red-300 font-semibold px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20 transition-all cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'جاري نشر الإعلان وتوليد الـ ID...' : 'عرض الحساب للبيع'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}