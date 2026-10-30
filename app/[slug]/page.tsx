// app/[slug]/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Product {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  type?: string; 
  image?: string; 
  icon?: string;
  stock?: number;
  status?: string | number;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug;

  if (!rawSlug || rawSlug === 'undefined' || rawSlug === 'null') {
    return { title: 'Produk Tidak Ditemukan | Ornot Prem' };
  }

  const slug = decodeURIComponent(rawSlug).toLowerCase().trim().replace(/-/g, ' ');
  const brandName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `Beli Akun Premium ${brandName} Murah & Otomatis | Ornot Prem`,
    description: `Dapatkan akun premium ${brandName} dengan harga termurah. Proses pengiriman otomatis 24/7, aman, dan bergaransi penuh hanya di Ornot Prem.`,
    keywords: [`beli ${slug}`, `akun premium ${slug}`, `${slug} murah`, 'jual beli akun', 'ornot prem', 'akun premium otomatis'],
    openGraph: {
      title: `Beli Akun Premium ${brandName} - Pengiriman Otomatis`,
      description: `Pilih durasi paket berlangganan ${brandName} yang paling sesuai dengan kebutuhanmu. Sistem pengiriman otomatis setelah pembayaran.`,
      url: `https://ornotprem.my.id/${rawSlug}`,
      siteName: 'Ornot Prem',
      locale: 'id_ID',
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug;

  // JIKA SLUG BERNILAI UNDEFINED / NULL, LANGSUNG BUKA HALAMAN 404
  if (!rawSlug || rawSlug === 'undefined' || rawSlug === 'null' || rawSlug.trim() === '') {
    notFound();
  }

  const decodedSlug = decodeURIComponent(rawSlug).toLowerCase().trim();
  const searchKeyword = decodedSlug.replace(/-/g, ' ').trim();
  const firstWord = searchKeyword.split(' ')[0];

  let allProducts: Product[] = [];
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
      if (Array.isArray(result)) allProducts = result;
      else if (result && Array.isArray(result.data)) allProducts = result.data;
      else if (result && Array.isArray(result.products)) allProducts = result.products;
    } else {
      debugError = `Gagal memuat API Premku. Status: ${premkuRes.status}`;
    }

    if (supabaseRes.data) {
      supabaseRes.data.forEach((setting) => {
        if (setting.key_name === 'default_margin') {
          defaultMargin = Number(setting.value) || 5000;
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

  // Filter produk berdasarkan nama brand
  let appProducts: Product[] = [];
  if (searchKeyword) {
    appProducts = allProducts.filter(p => {
      if (!p.name) return false;
      const brandName = p.name.trim().split(' ')[0].toLowerCase();
      return brandName === firstWord || brandName === searchKeyword;
    });

    if (appProducts.length === 0 && allProducts.length > 0) {
      appProducts = allProducts.filter(p => {
        if (!p.name) return false;
        const pNameLower = p.name.toLowerCase();
        return pNameLower.includes(searchKeyword) || pNameLower.replace(/\s+/g, '-').includes(decodedSlug);
      });
    }
  }

  if (appProducts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl sm:rounded-3xl max-w-md text-center shadow-xl shadow-gray-200/50">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-50 text-rose-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mx-auto mb-3">
            🔍
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">Produk Tidak Ditemukan!</h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-5">
            Sistem tidak menemukan produk dengan kata kunci: <strong className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded font-mono">&quot;{searchKeyword}&quot;</strong>
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all"
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

  const brandNameDisplay = appProducts[0].name.trim().split(' ')[0];
  const brandImage = appProducts[0].image || appProducts[0].icon || null;
  const totalStock = appProducts.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

  const mainBrandDescription = appProducts.find(p => p.description && p.description.trim().length > 10)?.description 
    || `Pilih durasi paket berlangganan ${brandNameDisplay} yang paling sesuai. Pengiriman detail akun diproses otomatis 24/7 setelah pembayaran.`;

  const prices = appProducts.map(p => {
    const productId = String(p.id);
    const basePrice = Number(p.price) || 0;
    const margin = marginMap[productId] !== undefined ? marginMap[productId] : defaultMargin;
    return basePrice + margin;
  });

  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `Akun Premium ${brandNameDisplay}`,
    "image": brandImage || "https://ornotprem.my.id/default-image.jpg",
    "description": mainBrandDescription,
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
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[500px] h-[280px] sm:w-[600px] sm:h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[100px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {debugError && (
          <div className="mb-4 bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
            <p className="text-rose-700 font-bold text-xs mb-0.5">Terjadi Kesalahan API:</p>
            <p className="text-rose-600 text-[10px] font-mono">{debugError}</p>
          </div>
        )}

        <header className="bg-white border border-gray-100/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-3.5 sm:gap-6 shadow-lg shadow-gray-200/40 mb-4 sm:mb-8">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-sm overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 shrink-0 relative border border-indigo-100">
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
          
          <div className="text-center sm:text-left flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] sm:text-xs font-bold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                {appProducts.length} Varian
              </span>
              
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wide border ${
                totalStock > 0 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {totalStock > 0 ? `🟢 Stok: ${totalStock}` : '🔴 Kosong'}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 mb-1.5 capitalize">
              {brandNameDisplay} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700">Premium</span>
            </h1>
            
            <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-xl border border-slate-100 text-left">
              <p className="text-gray-600 text-[11px] sm:text-xs font-medium leading-relaxed line-clamp-3 sm:line-clamp-none">
                {mainBrandDescription}
              </p>
            </div>
          </div>
        </header>

        <section aria-label={`Daftar Harga Paket ${brandNameDisplay}`}>
          <div className="flex items-center justify-between mb-2.5 sm:mb-4 px-1">
            <h2 className="text-sm sm:text-lg font-extrabold text-gray-900">Pilih Paket Layanan</h2>
            <span className="text-[11px] sm:text-xs font-bold text-gray-400">{appProducts.length} pilihan</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {appProducts.map((product) => {
              const productId = String(product.id);
              const basePrice = Number(product.price) || 0;
              const productMargin = marginMap[productId] !== undefined ? marginMap[productId] : defaultMargin;
              
              const finalPrice = basePrice > 0 ? basePrice + productMargin : 0;
              const productStock = Number(product.stock) || 0;
              const isAvailable = productStock > 0;
              const productImage = product.image || product.icon || '';
              
              return (
                <article 
                  key={product.id} 
                  className="group bg-white border border-gray-100 hover:border-indigo-200 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-sm hover:shadow-indigo-500/10 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-xs sm:text-base font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1">
                      {product.type && (
                        <span className="bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                          {product.type}
                        </span>
                      )}
                      <span className={`text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        isAvailable 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {isAvailable ? `Stok: ${productStock}` : 'Habis'}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-[10px] sm:text-xs text-gray-500 leading-normal bg-slate-50 p-1.5 sm:p-2 rounded-lg border border-slate-100 font-medium line-clamp-2 sm:line-clamp-3">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 mt-2.5 flex flex-col gap-1.5">
                    <div>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Harga Nett</p>
                      <p className="text-xs sm:text-xl font-black text-gray-900">
                        Rp {finalPrice.toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    {isAvailable ? (
                      <Link 
                        href={`/checkout?id=${product.id}&name=${encodeURIComponent(product.name)}&price=${finalPrice}&basePrice=${basePrice}&margin=${productMargin}${productImage ? `&image=${encodeURIComponent(productImage)}` : ''}`}
                        title={`Checkout ${product.name}`}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 text-[10px] sm:text-xs shadow-sm shadow-indigo-600/20 text-center"
                      >
                        <span>Pilih</span>
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    ) : (
                      <button 
                        disabled 
                        className="w-full bg-gray-100 text-gray-400 font-extrabold py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl cursor-not-allowed text-[10px] sm:text-xs text-center"
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