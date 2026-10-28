// app/[slug]/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

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
  image?: string; 
  icon?: string;
  stock?: number;
  status?: string | number;
}

// GENERATE METADATA DINAMIS UNTUK SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug).toLowerCase().trim();
  const brandName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `Beli Akun Premium ${brandName} Murah & Otomatis | Ornot Prem`,
    description: `Dapatkan akun premium ${brandName} dengan harga termurah. Proses pengiriman otomatis 24/7, aman, dan bergaransi penuh hanya di Ornot Prem.`,
    keywords: [`beli ${slug}`, `akun premium ${slug}`, `${slug} murah`, 'jual beli akun', 'ornot prem', 'akun premium otomatis'],
    openGraph: {
      title: `Beli Akun Premium ${brandName} - Pengiriman Otomatis`,
      description: `Pilih durasi paket berlangganan ${brandName} yang paling sesuai dengan kebutuhanmu. Sistem pengiriman otomatis setelah pembayaran.`,
      url: `https://ornotprem.my.id/${slug}`,
      siteName: 'Ornot Prem',
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Beli Akun Premium ${brandName} Murah`,
      description: `Upgrade akun ${brandName} kamu sekarang. Instan dan bergaransi!`,
    },
  };
}

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug).toLowerCase().trim();

  let allProducts: Product[] = [];
  let debugError = "";
  
  // Storage lookup margin dari database
  const marginMap: Record<string, number> = {};
  let defaultMargin = 0;

  try {
    // Ambil API Produk dan Seluruh Setting Margin dari Supabase secara paralel
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

    // Parse Data Premku
    if (premkuRes.ok) {
      const result = await premkuRes.json();
      if (Array.isArray(result)) allProducts = result;
      else if (result && Array.isArray(result.data)) allProducts = result.data;
      else if (result && Array.isArray(result.products)) allProducts = result.products;
    } else {
      debugError = `Gagal memuat API Premku. Status: ${premkuRes.status}`;
    }

    // Parse Setting Margin dari Supabase
    if (supabaseRes.data) {
      supabaseRes.data.forEach((setting) => {
        if (setting.key_name === 'default_margin') {
          defaultMargin = Number(setting.value) || 0;
        } else if (setting.key_name.startsWith('margin_')) {
          const productId = setting.key_name.replace('margin_', '');
          marginMap[productId] = Number(setting.value) || 0;
        }
      });
    }

  } catch (error: unknown) {
    if (error instanceof Error) {
      debugError = `Koneksi gagal: ${error.message}`;
    } else {
      debugError = 'Koneksi gagal: Kesalahan tidak diketahui';
    }
  }

  // Filter produk berdasarkan slug brand
  let appProducts = allProducts.filter(p => {
    if (!p.name) return false;
    const brandName = p.name.trim().split(' ')[0].toLowerCase();
    return brandName === decodedSlug;
  });

  if (appProducts.length === 0 && allProducts.length > 0) {
    appProducts = allProducts.filter(p => 
      p.name?.toLowerCase().includes(decodedSlug)
    );
  }

  // JIKA PRODUK TIDAK DITEMUKAN
  if (appProducts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-gray-100 p-8 rounded-3xl max-w-md text-center shadow-xl shadow-gray-200/50">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            🔍
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Produk Tidak Ditemukan!</h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-6">
            Sistem tidak menemukan produk dengan kata kunci: <strong className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded font-mono">&quot;{decodedSlug}&quot;</strong>
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all"
          >
            <span>Kembali ke Beranda</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  const brandNameDisplay = appProducts.length > 0 ? appProducts[0].name.trim().split(' ')[0] : decodedSlug.toUpperCase();
  const brandImage = appProducts.length > 0 ? (appProducts[0].image || appProducts[0].icon) : null;

  // Menghitung total seluruh stok dari semua varian
  const totalStock = appProducts.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

  // Hitung Harga Jual Akhir Pengguna (Base Price + Margin dari Settings)
  const prices = appProducts.map(p => {
    const productId = String(p.id);
    const basePrice = Number(p.price) || 0;
    const margin = marginMap[productId] !== undefined ? marginMap[productId] : defaultMargin;
    return basePrice + margin;
  });

  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);

  // SCHEMA MARKUP JSON-LD UNTUK SEO
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `Akun Premium ${brandNameDisplay}`,
    "image": brandImage || "https://ornotprem.my.id/default-image.jpg",
    "description": `Beli layanan berlangganan akun premium ${brandNameDisplay} dengan harga termurah, proses otomatis 24/7.`,
    "brand": {
      "@type": "Brand",
      "name": brandNameDisplay
    },
    "offers": {
      "@type": "AggregateOffer",
      "url": `https://ornotprem.my.id/${decodedSlug}`,
      "priceCurrency": "IDR",
      "lowPrice": lowestPrice,
      "highPrice": highestPrice,
      "offerCount": appProducts.length,
      "availability": totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-20 sm:pb-24">
      
      {/* INJEKSI JSON-LD KE DALAM HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Soft Glow Aksen Indigo-Purple */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Navigasi Kembali */}
        <div className="mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-extrabold text-xs sm:text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Katalog
          </Link>
        </div>

        {debugError && (
          <div className="mb-6 bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-center">
            <p className="text-rose-700 font-bold text-xs mb-0.5">Terjadi Kesalahan API:</p>
            <p className="text-rose-600 text-[11px] font-mono">{debugError}</p>
          </div>
        )}

        {/* HEADER BRAND APLIKASI */}
        <header className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-8 shadow-xl shadow-gray-200/50 mb-6 sm:mb-10">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-md overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 shrink-0 relative border border-indigo-100">
            {brandImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={brandImage} 
                alt={`Logo Akun Premium ${brandNameDisplay}`} 
                className="w-full h-full object-cover" 
                decoding="async" 
              />
            ) : (
              brandNameDisplay.charAt(0)
            )}
          </div>
          
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                {appProducts.length} Varian Paket
              </span>
              
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide border ${
                totalStock > 0 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {totalStock > 0 ? `🟢 Stok: ${totalStock}` : '🔴 Stok Kosong'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 mb-2 capitalize">
              {brandNameDisplay} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700">Premium</span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
              Pilih durasi paket berlangganan {brandNameDisplay} yang paling sesuai. Pengiriman detail akun diproses otomatis 24/7 setelah pembayaran.
            </p>
          </div>
        </header>

        {/* SECTION DAFTAR PAKET */}
        <section aria-label={`Daftar Harga Paket ${brandNameDisplay}`}>
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <h2 className="text-base sm:text-xl font-extrabold text-gray-900">Pilih Paket Layanan</h2>
            <span className="text-xs font-bold text-gray-400">{appProducts.length} pilihan</span>
          </div>
          
          {/* DAFTAR PAKET (GRID 2 KOLOM PADA MOBILE & DESKTOP) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {appProducts.map((product) => {
              const productId = String(product.id);
              const basePrice = Number(product.price) || 0;
              const productMargin = marginMap[productId] !== undefined ? marginMap[productId] : defaultMargin;
              
              // Harga akhir yang ditampilkan ke pengguna
              const finalPrice = basePrice > 0 ? basePrice + productMargin : 0;
              const productStock = Number(product.stock) || 0;
              const isAvailable = productStock > 0;
              const productImage = product.image || product.icon || '';
              
              return (
                <article 
                  key={product.id} 
                  className="group bg-white border border-gray-100 hover:border-indigo-200 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-300 shadow-md shadow-gray-200/40 hover:shadow-indigo-500/10 flex flex-col justify-between"
                >
                  <div>
                    {/* Judul & Tipe */}
                    <div className="flex justify-between items-start mb-2 gap-1.5">
                      <h3 className="text-xs sm:text-base font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                    </div>

                    {/* Badge Tipe & Stok */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-3">
                      {product.type && (
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                          {product.type}
                        </span>
                      )}
                      <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isAvailable 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {isAvailable ? `Stok: ${productStock}` : 'Habis'}
                      </span>
                    </div>
                  </div>

                  {/* Bagian Harga & Tombol Beli */}
                  <div className="pt-3 border-t border-gray-100 mt-auto flex flex-col gap-2">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Harga Nett</p>
                      <p className="text-sm sm:text-2xl font-black text-gray-900">
                        Rp {finalPrice.toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    {isAvailable ? (
                      <Link 
                        href={`/checkout?id=${product.id}&name=${encodeURIComponent(product.name)}&price=${finalPrice}&basePrice=${basePrice}&margin=${productMargin}&image=${encodeURIComponent(productImage)}`}
                        title={`Checkout ${product.name}`}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-1 text-xs sm:text-sm shadow-md shadow-indigo-600/20 text-center"
                      >
                        <span>Pilih</span>
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    ) : (
                      <button 
                        disabled 
                        className="w-full bg-gray-100 text-gray-400 font-extrabold py-2 sm:py-3 rounded-xl sm:rounded-2xl cursor-not-allowed text-xs sm:text-sm text-center"
                      >
                        Habis
                      </button>
                    )}
                  </div>

                </article>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}