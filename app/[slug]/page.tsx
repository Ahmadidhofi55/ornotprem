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

// Fungsi margin konsisten yang terhubung ke database
const getConsistentMargin = (brandName: string, minMargin: number, maxMargin: number) => {
  const diff = maxMargin - minMargin;
  const steps = diff > 0 ? Math.floor(diff / 100) + 1 : 1;
  
  let hash = 0;
  for (let i = 0; i < brandName.length; i++) {
    hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return minMargin + (Math.abs(hash) % steps) * 100;
};

// 1. GENERATE METADATA DINAMIS UNTUK SEO
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
  
  // Nilai default jika database kosong/gagal
  let minMargin = 500;
  let maxMargin = 1000;

  try {
    // Ambil API Produk dan Setting Database secara paralel
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

    // Parse Data Premku
    if (premkuRes.ok) {
      const result = await premkuRes.json();
      if (Array.isArray(result)) allProducts = result;
      else if (result && Array.isArray(result.data)) allProducts = result.data;
      else if (result && Array.isArray(result.products)) allProducts = result.products;
    } else {
      debugError = `Gagal memuat API Premku. Status: ${premkuRes.status}`;
    }

    // Parse Data Supabase
    if (supabaseRes.data) {
      const minData = supabaseRes.data.find((s) => s.key_name === 'min_margin');
      const maxData = supabaseRes.data.find((s) => s.key_name === 'max_margin');
      
      if (minData && !isNaN(Number(minData.value))) minMargin = Number(minData.value);
      if (maxData && !isNaN(Number(maxData.value))) maxMargin = Number(maxData.value);
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

  if (appProducts.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-3xl max-w-lg text-center shadow-2xl">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Produk Tidak Ditemukan!</h2>
          <p className="text-gray-300 mb-4">
            Sistem mencoba mencari produk dengan kata kunci: <strong className="text-white bg-white/10 px-2 py-1 rounded">&quot;{decodedSlug}&quot;</strong>
          </p>
          <Link href="/" className="bg-white text-black font-bold px-6 py-3 rounded-full inline-block hover:bg-cyan-400 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const brandNameDisplay = appProducts.length > 0 ? appProducts[0].name.trim().split(' ')[0] : decodedSlug.toUpperCase();
  const brandImage = appProducts.length > 0 ? (appProducts[0].image || appProducts[0].icon) : null;
  
  // Hitung margin menggunakan data dinamis dari Supabase
  const marginReseller = getConsistentMargin(decodedSlug, minMargin, maxMargin);

  // Menghitung total seluruh stok dari semua varian produk aplikasi ini
  const totalStock = appProducts.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

  // Hitung Harga Termurah dan Termahal untuk Skema JSON-LD
  const prices = appProducts.map(p => (Number(p.price) || 0) + marginReseller);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);

  // 2. SCHEMA MARKUP JSON-LD UNTUK DETAIL PRODUK
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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 pb-24">
      {/* INJEKSI JSON-LD KE DALAM HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {debugError && (
          <div className="mb-8 bg-red-900/30 border border-red-500/50 p-4 rounded-2xl text-center">
            <p className="text-red-400 font-bold mb-1">Terjadi Kesalahan API:</p>
            <p className="text-red-200 text-sm">{debugError}</p>
          </div>
        )}

        {/* HEADER APLIKASI (SEMANTIK) */}
        <header className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl mb-12">
          <div className="w-32 h-32 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-lg overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 flex-shrink-0 relative">
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
          
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                {appProducts.length} Varian Paket
              </span>
              
              {/* Badge Informasi Total Stok */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${
                totalStock > 0 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {totalStock > 0 ? `🟢 Stok Tersedia: ${totalStock}` : '🔴 Stok Kosong'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 capitalize">
              {brandNameDisplay} Premium
            </h1>
            <p className="text-gray-400 text-lg">
              Pilih durasi paket berlangganan {brandNameDisplay} yang paling sesuai dengan kebutuhanmu. Sistem pengiriman otomatis setelah pembayaran.
            </p>
          </div>
        </header>

        <section aria-label={`Daftar Harga Paket ${brandNameDisplay}`}>
          <h2 className="text-2xl font-bold mb-6">Pilih Paket Layanan</h2>
          
          {/* DAFTAR PAKET & STOK PER VARIAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appProducts.map((product) => {
              const basePrice = Number(product.price) || 0;
              const finalPrice = basePrice > 0 ? basePrice + marginReseller : 0;
              const productStock = Number(product.stock) || 0;
              const isAvailable = productStock > 0;
              const productImage = product.image || product.icon || '';
              
              return (
                <article key={product.id} className="group bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/[0.08] p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between">
                  
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      {product.type && (
                        <span className="bg-white/10 text-gray-300 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          {product.type}
                        </span>
                      )}
                    </div>

                    {/* Indikator Stok Kecil di Tiap Varian */}
                    <div className="mb-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-md inline-block ${
                        isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isAvailable ? `Stok: ${productStock} unit` : 'Stok Habis'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-auto">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Harga Nett</p>
                      <p className="text-2xl font-black text-white">
                        Rp {finalPrice.toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    {isAvailable ? (
                      // TAUTAN TOMBOL DENGAN PARAMETER GAMBAR LENGKAP & SEO TITLE
                      <Link 
                        href={`/checkout?id=${product.id}&name=${encodeURIComponent(product.name)}&price=${finalPrice}&image=${encodeURIComponent(productImage)}`}
                        title={`Checkout ${product.name}`}
                        className="bg-white text-black hover:bg-cyan-400 font-bold px-6 py-3 rounded-full transition-colors flex items-center gap-2"
                      >
                        Pilih
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m-7-7H3" />
                        </svg>
                      </Link>
                    ) : (
                      <button disabled className="bg-white/5 text-gray-500 font-bold px-6 py-3 rounded-full cursor-not-allowed">
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