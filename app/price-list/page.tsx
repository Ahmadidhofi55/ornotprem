// app/price-list/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

// --- METADATA SEO ---
export const metadata: Metadata = {
  title: 'Daftar Harga (Pricelist) Akun Premium Termurah | Ornot Prem',
  description: 'Cek daftar harga lengkap akun premium Netflix, Spotify, Canva, dan lainnya. Harga termurah, proses otomatis, dan bergaransi.',
  keywords: ['daftar harga akun premium', 'price list netflix', 'harga spotify pro', 'harga canva pro', 'ornot prem price list', 'harga akun premium termurah'],
  openGraph: {
    title: 'Daftar Harga Akun Premium - Ornot Prem',
    description: 'Daftar harga lengkap dan transparan untuk semua produk layanan akun premium kami.',
    url: 'https://ornotprem.my.id/price-list',
    siteName: 'Ornot Prem',
    locale: 'id_ID',
    type: 'website',
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Product {
  id: number | string;
  name: string;
  price: number;
  category?: string;
  type?: string; 
  stock?: number;
  image?: string;
  icon?: string;
}

const CATEGORIES = [
  { id: 'semua', label: 'Semua Produk' },
  { id: 'design-edit', label: 'Design & Edit' },
  { id: 'stream-media', label: 'Stream & Media' },
  { id: 'apps-tools', label: 'Apps & Tools' }
];

const determineCategory = (productName: string, productCategory: string) => {
  const text = `${productName} ${productCategory}`.toLowerCase();
  
  const isStream = ['netflix', 'spotify', 'youtube', 'disney', 'prime', 'vidio', 'viu', 'iqiyi', 'we tv', 'wetv', 'bilibili', 'hbo', 'apple tv', 'crunchyroll', 'stream', 'nonton', 'music', 'movie'].some(k => text.includes(k));
  if (isStream) return 'stream-media';

  const isDesign = ['canva', 'adobe', 'capcut', 'figma', 'picsart', 'corel', 'vsco', 'lightroom', 'alight', 'freepik', 'envato', 'design', 'edit', 'kreatif', 'art'].some(k => text.includes(k));
  if (isDesign) return 'design-edit';
  
  return 'apps-tools';
};

export default async function PriceListPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ filter?: string; q?: string }> 
}) {
  const params = await searchParams;
  const activeFilter = params.filter || 'semua';
  const searchQuery = params.q || ''; 

  let rawProducts: Product[] = [];
  let debugError = "";
  
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
      supabase
        .from('settings')
        .select('key_name, value')
    ]);

    if (premkuRes.ok) {
      const result = await premkuRes.json();
      if (Array.isArray(result)) rawProducts = result;
      else if (result && Array.isArray(result.data)) rawProducts = result.data;
      else if (result && Array.isArray(result.products)) rawProducts = result.products;
    } else {
      debugError = `Gagal memuat API. Status: ${premkuRes.status}`;
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
  } catch (error: unknown) {
    debugError = error instanceof Error ? `Koneksi ke API gagal: ${error.message}` : 'Terjadi kesalahan API';
  }

  // Menghitung harga jual resmi berdasarkan margin presisi Supabase
  const processedProducts = rawProducts.map(product => {
    const brandName = product.name ? product.name.trim().split(' ')[0] : 'Lainnya';
    const slug = brandName.toLowerCase();
    const productId = String(product.id);
    const basePrice = Number(product.price) || 0;
    const margin = marginMap[productId] !== undefined ? marginMap[productId] : defaultMargin;
    const finalPrice = basePrice + margin;

    return { ...product, brandName, slug, basePrice, margin, finalPrice };
  });

  const filteredProducts = processedProducts.filter(p => {
    if (searchQuery) {
      const textToSearch = `${p.brandName} ${p.name || ''}`.toLowerCase();
      if (!textToSearch.includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    if (activeFilter === 'semua') return true;
    
    const categoryId = determineCategory(p.name || '', p.category || '');
    return activeFilter === categoryId;
  });

  const groupedList = filteredProducts.reduce((acc, item) => {
    if (!acc[item.brandName]) acc[item.brandName] = [];
    acc[item.brandName].push(item);
    return acc;
  }, {} as Record<string, typeof filteredProducts>);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Daftar Harga Akun Premium Ornot Prem",
    "description": "Price list lengkap semua produk akun premium termurah dan bergaransi.",
    "itemListElement": Object.keys(groupedList).map((brand, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": brand,
        "url": `https://ornotprem.my.id/${groupedList[brand][0].slug}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        <header className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Realtime Update Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            Daftar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">Harga Lengkap</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg font-medium">
            Transparansi harga seluruh produk digital dan layanan premium di ORNOT PREM dengan proses pengiriman otomatis 24/7.
          </p>
        </header>

        {debugError && (
          <div className="mb-8 bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center max-w-2xl mx-auto shadow-sm">
            <p className="text-rose-700 font-bold mb-1">Peringatan API:</p>
            <p className="text-rose-600 text-sm">{debugError}</p>
          </div>
        )}

        <div className="max-w-xl mx-auto mb-6 relative z-10">
          <form method="GET" action="/price-list" className="relative">
            {activeFilter !== 'semua' && <input type="hidden" name="filter" value={activeFilter} />}
            
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input 
              type="text" 
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari nama aplikasi atau produk..." 
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-11 pr-14 text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all shadow-md shadow-gray-200/50 placeholder:text-gray-400"
            />
            
            <button 
              type="submit" 
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white p-2.5 rounded-xl transition-all shadow-md"
              title="Cari"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((tab) => {
            const queryParams = new URLSearchParams();
            if (tab.id !== 'semua') queryParams.set('filter', tab.id);
            if (searchQuery) queryParams.set('q', searchQuery);
            
            const qString = queryParams.toString();
            const targetUrl = qString ? `/price-list?${qString}` : '/price-list';
            
            return (
              <Link
                key={tab.id}
                href={targetUrl}
                className={`px-5 py-2.5 rounded-2xl sm:rounded-full text-xs font-extrabold transition-all duration-300 ${
                  activeFilter === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 border border-gray-200/80 shadow-sm'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50">
          {Object.keys(groupedList).length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="text-xl font-extrabold text-gray-900 mb-1">Produk tidak ditemukan.</p>
              <p className="text-sm text-gray-500 mb-4">Coba gunakan kata kunci lain atau pilih Semua Produk.</p>
              {searchQuery && (
                <Link href="/price-list" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-xs font-extrabold transition-colors shadow-md">
                  Reset Pencarian
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/80 text-gray-500 text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-4 px-6 w-[40%]">Nama Aplikasi</th>
                    <th className="py-4 px-6">Tipe Akun</th>
                    <th className="py-4 px-6">Stok Status</th>
                    <th className="py-4 px-6 text-right">Harga</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium">
                  {Object.keys(groupedList).map((brand) => (
                    groupedList[brand].map((product, index) => {
                      const stockVal = Number(product.stock) || 0;
                      const isReady = stockVal > 0;
                      const imgUrl = product.image || product.icon;

                      return (
                        <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors group">
                          
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              {index === 0 ? (
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                  {imgUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={imgUrl} alt={brand} loading="lazy" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="font-extrabold text-indigo-700 text-lg">{brand.charAt(0)}</span>
                                  )}
                                </div>
                              ) : (
                                <div className="w-10 shrink-0"></div>
                              )}
                              <span className="font-extrabold text-gray-900 block group-hover:text-indigo-600 transition-colors">
                                {product.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span className="bg-gray-100 border border-gray-200/80 text-gray-700 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase">
                              {product.type || 'Reguler'}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                              isReady 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                                : 'bg-rose-50 text-rose-700 border-rose-200/80'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              {isReady ? `Ready (${stockVal})` : 'Habis'}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right font-black text-indigo-700 text-base">
                            Rp {product.finalPrice.toLocaleString('id-ID')}
                          </td>

                          <td className="py-4 px-6 text-center">
                            {isReady ? (
                              <Link
                                href={`/${product.slug}`}
                                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2 rounded-xl transition-all text-xs shadow-md shadow-indigo-600/20"
                                title={`Lihat detail ${product.name}`}
                              >
                                Detail
                              </Link>
                            ) : (
                              <button disabled className="bg-gray-100 border border-gray-200 text-gray-400 font-bold px-5 py-2 rounded-xl text-xs cursor-not-allowed">
                                Kosong
                              </button>
                            )}
                          </td>

                        </tr>
                      );
                    })
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