// app/price-list/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

// --- METADATA SEO ---
export const metadata: Metadata = {
  title: 'Daftar Harga (Pricelist) Akun Premium Termurah | Ornot Prem',
  description: 'Cek daftar harga lengkap akun premium Netflix, Spotify, Canva, dan lainnya. Harga reseller termurah, proses otomatis, dan bergaransi.',
  keywords: ['daftar harga akun premium', 'price list netflix', 'harga reseller spotify', 'harga canva pro', 'ornot prem price list', 'harga akun premium termurah'],
  openGraph: {
    title: 'Daftar Harga Akun Premium - Ornot Prem',
    description: 'Daftar harga lengkap dan transparan untuk semua produk layanan akun premium kami.',
    url: 'https://ornotprem.my.id/price-list',
    siteName: 'Ornot Prem',
    locale: 'id_ID',
    type: 'website',
  },
};

// Inisialisasi Supabase Client
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

// Fungsi margin konsisten
const getConsistentMargin = (brandName: string, minMargin: number, maxMargin: number) => {
  const diff = maxMargin - minMargin;
  const steps = diff > 0 ? Math.floor(diff / 100) + 1 : 1;
  let hash = 0;
  for (let i = 0; i < brandName.length; i++) {
    hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return minMargin + (Math.abs(hash) % steps) * 100;
};

// Kategori Filter (Sama dengan HomePage)
const CATEGORIES = [
  { id: 'semua', label: 'Semua Produk' },
  { id: 'design-edit', label: 'Design & Edit' },
  { id: 'stream-media', label: 'Stream & Media' },
  { id: 'apps-tools', label: 'Apps & Tools' }
];

// Logika kategori
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
  
  let minMargin = 500;
  let maxMargin = 1000;

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
        .in('key_name', ['min_margin', 'max_margin'])
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
      const minData = supabaseRes.data.find((s) => s.key_name === 'min_margin');
      const maxData = supabaseRes.data.find((s) => s.key_name === 'max_margin');
      if (minData && !isNaN(Number(minData.value))) minMargin = Number(minData.value);
      if (maxData && !isNaN(Number(maxData.value))) maxMargin = Number(maxData.value);
    }
  } catch (error: unknown) {
    debugError = error instanceof Error ? `Koneksi ke API gagal: ${error.message}` : 'Terjadi kesalahan API';
  }

  // Pengolahan data (Penambahan harga reseller)
  const processedProducts = rawProducts.map(product => {
    const brandName = product.name ? product.name.split(' ')[0] : 'Lainnya';
    const slug = brandName.toLowerCase();
    const margin = getConsistentMargin(slug, minMargin, maxMargin);
    const finalPrice = (Number(product.price) || 0) + margin;

    return { ...product, brandName, slug, finalPrice };
  });

  // Filter gabungan (Tab + Search Bar)
  const filteredProducts = processedProducts.filter(p => {
    // 1. Filter Pencarian Teks
    if (searchQuery) {
      const textToSearch = `${p.brandName} ${p.name || ''}`.toLowerCase();
      if (!textToSearch.includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    // 2. Filter Kategori Tab
    if (activeFilter === 'semua') return true;
    
    // Pencocokan kategori dinamis
    const categoryId = determineCategory(p.name || '', p.category || '');
    return activeFilter === categoryId;
  });

  // Pengelompokan berdasarkan Brand
  const groupedList = filteredProducts.reduce((acc, item) => {
    if (!acc[item.brandName]) acc[item.brandName] = [];
    acc[item.brandName].push(item);
    return acc;
  }, {} as Record<string, typeof filteredProducts>);

  // --- SCHEMA MARKUP JSON-LD ---
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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Header Halaman */}
        <header className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Realtime Update Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            Daftar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Harga Lengkap</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Transparansi harga seluruh produk digital dan layanan premium di ORNOT PREM. Harga khusus reseller dengan pengiriman otomatis.
          </p>
        </header>

        {debugError && (
          <div className="mb-8 bg-red-900/30 border border-red-500/50 p-4 rounded-2xl text-center max-w-2xl mx-auto">
            <p className="text-red-400 font-bold mb-1">Peringatan API:</p>
            <p className="text-red-200 text-sm">{debugError}</p>
          </div>
        )}

        {/* --- SEARCH BAR --- */}
        <div className="max-w-xl mx-auto mb-6 relative z-10">
          <form method="GET" action="/price-list" className="relative">
            {activeFilter !== 'semua' && <input type="hidden" name="filter" value={activeFilter} />}
            <input 
              type="text" 
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari nama aplikasi atau produk..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 px-6 pr-14 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors backdrop-blur-sm shadow-lg"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-400 text-black p-2 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>
        </div>

        {/* Filter Kategori Pricelist */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((tab) => {
            const queryParams = new URLSearchParams();
            if (tab.id !== 'semua') queryParams.set('filter', tab.id);
            if (searchQuery) queryParams.set('q', searchQuery);
            
            // Format URL dengan aman ke /price-list
            const qString = queryParams.toString();
            const targetUrl = qString ? `/price-list?${qString}` : '/price-list';
            
            return (
              <Link
                key={tab.id}
                href={targetUrl}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Tabel Pricelist */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {Object.keys(groupedList).length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xl font-semibold">Produk tidak ditemukan.</p>
              <p className="text-sm mt-2">Coba gunakan kata kunci lain atau pilih Semua Produk.</p>
              {searchQuery && (
                <Link href="/price-list" className="mt-4 inline-block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">
                  Reset Pencarian
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-5 px-6 w-[40%]">Nama Aplikasi / Paket</th>
                    <th className="py-5 px-6">Tipe Akun</th>
                    <th className="py-5 px-6">Status Stok</th>
                    <th className="py-5 px-6 text-right">Harga</th>
                    <th className="py-5 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {Object.keys(groupedList).map((brand) => (
                    groupedList[brand].map((product, index) => {
                      const stockVal = Number(product.stock) || 0;
                      const isReady = stockVal > 0;
                      const imgUrl = product.image || product.icon;

                      return (
                        <tr key={product.id} className="hover:bg-white/[0.04] transition-colors group">
                          
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              {index === 0 ? (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-900 to-blue-900 flex items-center justify-center overflow-hidden shrink-0">
                                  {imgUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={imgUrl} alt={brand} loading="lazy" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="font-bold text-white text-lg">{brand.charAt(0)}</span>
                                  )}
                                </div>
                              ) : (
                                <div className="w-10 shrink-0"></div>
                              )}
                              <span className="font-bold text-white block group-hover:text-cyan-400 transition-colors">
                                {product.name}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span className="bg-white/10 border border-white/5 text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">
                              {product.type || 'Reguler'}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${
                              isReady 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                              {isReady ? `Ready (${stockVal})` : 'Habis'}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right font-black text-white text-base">
                            Rp {product.finalPrice.toLocaleString('id-ID')}
                          </td>

                          <td className="py-4 px-6 text-center">
                            {isReady ? (
                              <Link
                                href={`/${product.slug}`}
                                className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2 rounded-xl transition-all text-xs shadow-lg shadow-cyan-600/20"
                                title={`Lihat detail ${product.name}`}
                              >
                                Detail
                              </Link>
                            ) : (
                              <button disabled className="bg-white/5 border border-white/5 text-gray-500 font-bold px-5 py-2 rounded-xl text-xs cursor-not-allowed">
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