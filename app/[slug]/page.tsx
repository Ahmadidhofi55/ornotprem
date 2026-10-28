// app/[slug]/page.tsx
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Product {
  id: number | string;
  name: string;
  price: number;
  type?: string;
  image?: string;
  icon?: string;
  stock?: number;
  description?: string;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug).toLowerCase().trim();

  let allProducts: Product[] = [];
  const marginMap: Record<string, number> = {};
  let defaultMargin = 5000;

  try {
    const [premkuRes, supabaseRes] = await Promise.all([
      fetch('https://premku.com/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.PREMKU_API_KEY as string,
        },
        body: JSON.stringify({}),
        cache: 'no-store',
      }),
      supabase.from('settings').select('key_name, value')
    ]);

    if (premkuRes.ok) {
      const result = await premkuRes.json();
      if (Array.isArray(result)) allProducts = result;
      else if (result?.data) allProducts = result.data;
      else if (result?.products) allProducts = result.products;
    }

    if (supabaseRes.data) {
      supabaseRes.data.forEach((s) => {
        if (s.key_name === 'default_margin') {
          defaultMargin = Number(s.value) || 0;
        } else if (s.key_name.startsWith('margin_')) {
          const productIdKey = s.key_name.replace('margin_', '');
          marginMap[productIdKey] = Number(s.value) || 0;
        }
      });
    }
  } catch (e) {
    console.error("Gagal memuat produk:", e);
  }

  const appProducts = allProducts.filter(p => p.name?.toLowerCase().includes(decodedSlug));

  if (appProducts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl text-center shadow-xl border max-w-sm">
          <h2 className="text-lg font-black text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
          <Link href="/" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs inline-block">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const brandName = appProducts[0].name.split(' ')[0];
  const brandImage = appProducts[0].image || appProducts[0].icon;
  const brandDescription = appProducts[0].description || `Pilih varian paket berlangganan ${brandName} resmi dan otomatis 24/7.`;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* HEADER BRAND */}
        <header className="bg-white border rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-row items-center gap-4 sm:gap-6 shadow-xl mb-5 sm:mb-8">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-black overflow-hidden shrink-0 border border-indigo-100">
            {brandImage ? <img src={brandImage} alt={brandName} className="w-full h-full object-cover" /> : brandName.charAt(0)}
          </div>
          <div className="text-left min-w-0">
            <h1 className="text-lg sm:text-3xl font-black text-gray-900 mb-0.5 truncate">{brandName} Premium</h1>
            <p className="text-gray-500 text-[11px] sm:text-sm leading-snug line-clamp-2">{brandDescription}</p>
          </div>
        </header>

        {/* GRID 2 KOLOM DI MOBILE (ANDROID) & DESKTOP */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-5">
          {appProducts.map((p) => {
            const productId = String(p.id);
            const basePrice = Number(p.price) || 0;
            const margin = marginMap[productId] !== undefined ? marginMap[productId] : defaultMargin;
            const finalPrice = basePrice + margin;
            const isAvailable = (Number(p.stock) || 0) > 0;
            const productImage = p.image || p.icon || '';

            return (
              <article key={p.id} className="bg-white border border-gray-100 p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-1.5 gap-1">
                    <h3 className="text-xs sm:text-base font-extrabold text-gray-900 line-clamp-2 leading-snug">{p.name}</h3>
                    <span className={`text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 self-start ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {isAvailable ? `Stok: ${p.stock}` : 'Habis'}
                    </span>
                  </div>

                  {/* Deskripsi varian paket (ringkas 2 baris di HP) */}
                  {p.description && (
                    <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mb-3 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-gray-100">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 sm:pt-3 border-t border-gray-100 mt-2">
                  <p className="text-xs sm:text-xl font-black text-gray-900 mb-2">Rp {finalPrice.toLocaleString('id-ID')}</p>
                  {isAvailable ? (
                    <Link
                      href={`/checkout?id=${p.id}&name=${encodeURIComponent(p.name)}&price=${finalPrice}&basePrice=${basePrice}&margin=${margin}&image=${encodeURIComponent(productImage)}`}
                      className="w-full bg-indigo-600 text-white font-extrabold py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs block text-center shadow-md hover:bg-indigo-700 transition-colors"
                    >
                      Pilih Paket
                    </Link>
                  ) : (
                    <button disabled className="w-full bg-gray-100 text-gray-400 font-extrabold py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs cursor-not-allowed">
                      Stok Habis
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}