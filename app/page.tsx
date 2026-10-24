// app/page.tsx
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import HomeWidgets from '@/components/HomeWidgets';

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
}

interface GroupedProduct extends Product {
  brandName: string;
  slug: string;
  minPrice: number;
}

const getConsistentMargin = (brandName: string, minMargin: number, maxMargin: number) => {
  const diff = maxMargin - minMargin;
  const steps = diff > 0 ? Math.floor(diff / 100) + 1 : 1;

  let hash = 0;
  for (let i = 0; i < brandName.length; i++) {
    hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return minMargin + (Math.abs(hash) % steps) * 100;
};

const CATEGORIES = [
  { id: 'semua', label: 'Semua Produk', icon: '🔥' },
  { id: 'design-edit', label: 'Design & Edit', icon: '🎨' },
  { id: 'stream-media', label: 'Stream & Media', icon: '🎬' },
  { id: 'apps-tools', label: 'Apps & Tools', icon: '💼' }
];

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const params = await searchParams;
  const activeCategory = params.category || 'semua';
  const searchQuery = params.q?.toLowerCase() || '';

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
      debugError = `Gagal memuat API Premku. Status: ${premkuRes.status}`;
    }

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
      debugError = 'Koneksi gagal: Terjadi kesalahan yang tidak diketahui';
    }
  }

  const groupedProductsMap = rawProducts.reduce((acc, product) => {
    const brandName = product.name ? product.name.split(' ')[0] : 'Lainnya';
    const slug = brandName.toLowerCase();

    const randomMargin = getConsistentMargin(slug, minMargin, maxMargin);
    const basePrice = Number(product.price) || 0;
    const finalPrice = basePrice > 0 ? basePrice + randomMargin : 0;

    if (!acc[slug]) {
      acc[slug] = {
        ...product,
        brandName: brandName,
        slug: slug,
        minPrice: finalPrice
      };
    } else {
      if (finalPrice < acc[slug].minPrice) {
        acc[slug].minPrice = finalPrice;
      }
    }
    return acc;
  }, {} as Record<string, GroupedProduct>);

  const displayProducts = Object.values(groupedProductsMap);

  const filteredProducts = displayProducts.filter(p => {
    // 1. FILTER PENCARIAN
    if (searchQuery) {
      const matchesSearch =
        p.brandName.toLowerCase().includes(searchQuery) ||
        (p.name || '').toLowerCase().includes(searchQuery);
      if (!matchesSearch) return false;
    }

    // 2. FILTER KATEGORI
    if (activeCategory === 'semua') return true;

    const cat = (p.category || '').toLowerCase();
    const name = (p.name || '').toLowerCase();

    const isAppKeyword = name.includes('discord') || name.includes('nitro') || name.includes('hma') || name.includes('vpn') ||
      name.includes('ai ') || name.includes('chatgpt') || name.includes('zoom') || name.includes('microsoft') ||
      name.includes('google') || name.includes('turnitin') || name.includes('grammarly') || name.includes('nord') ||
      name.includes('office') || cat.includes('app') || cat.includes('tool') || cat.includes('vpn') || cat.includes('bot');

    const isDesignKeyword = name.includes('canva') || name.includes('adobe') || name.includes('capcut') || name.includes('figma') ||
      name.includes('picsart') || name.includes('corel') || cat.includes('design') || cat.includes('edit') ||
      cat.includes('kreatif') || cat.includes('art');

    const isStreamKeyword = name.includes('netflix') || name.includes('spotify') || name.includes('youtube') || name.includes('disney') ||
      name.includes('prime') || name.includes('vidio') || name.includes('viu') || name.includes('iqiyi') ||
      name.includes('we tv') || name.includes('bilibili') || cat.includes('stream') ||
      (cat.includes('media') && !cat.includes('social')) || cat.includes('nonton') || cat.includes('music') || cat.includes('hiburan');

    if (activeCategory === 'apps-tools') {
      if (isAppKeyword) return true;
      if (!isDesignKeyword && !isStreamKeyword) return true;
      return false;
    }

    if (activeCategory === 'design-edit') {
      if (isAppKeyword) return false;
      return isDesignKeyword;
    }

    if (activeCategory === 'stream-media') {
      if (isAppKeyword) return false;
      return isStreamKeyword;
    }

    return false;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": filteredProducts.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": `Akun Premium ${product.brandName}`,
        "url": `https://ornotprem.my.id/${product.slug}`,
        "image": product.image || product.icon || "https://ornotprem.my.id/default-image.jpg",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": product.minPrice,
          "priceCurrency": "IDR"
        }
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Soft Glow Aksen Indigo-Purple */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">

        {/* HERO SECTION */}
        <header className="text-center max-w-3xl mx-auto flex flex-col items-center px-4">
          {/* Badge Tagline Compact */}
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 shadow-xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="text-indigo-700 text-[11px] sm:text-xs font-bold tracking-wide uppercase">
              Proses Serba Otomatis 24/7
            </span>
          </div>

          {/* Judul Utama (Proporsional & Pas di HP & PC) */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2 sm:mb-3 leading-snug sm:leading-tight">
            Satu Tempat untuk Semua <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
              Langganan Premium Bergaransi
            </span>
          </h1>

          {/* Deskripsi Singkat & Ringkas */}
          <p className="text-gray-500 text-xs sm:text-sm md:text-base font-medium max-w-xl leading-relaxed">
            Dapatkan akses aplikasi premium resmi seperti Netflix, Canva, Spotify, dan Viu dengan harga terjangkau & garansi penuh.
          </p>
        </header>

        {/* WIDGET PENCARIAN & LACAK */}
        <HomeWidgets />

        {debugError && (
          <div className="mt-4 max-w-3xl mx-auto bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center shadow-sm">
            <p className="text-rose-700 font-bold mb-1">Error:</p>
            <p className="text-rose-600 text-sm">{debugError}</p>
          </div>
        )}

        {/* KATEGORI TABS SECTION (Scrollable Horizontal) */}
        <section aria-label="Kategori Produk" className="mt-8 flex overflow-x-auto gap-2.5 py-2 px-1 sm:justify-center whitespace-nowrap scrollbar-none">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={
                category.id === 'semua'
                  ? (searchQuery ? `/?q=${searchQuery}` : '/')
                  : `/?category=${category.id}${searchQuery ? `&q=${searchQuery}` : ''}`
              }
              title={`Kategori ${category.label}`}
              className={`shrink-0 px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl sm:rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center gap-2 ${activeCategory === category.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 border border-gray-200/80 shadow-sm'
                }`}
            >
              <span aria-hidden="true">{category.icon}</span>
              {category.label}
            </Link>
          ))}
        </section>

        {/* GRID PRODUK SECTION */}
        <section aria-label="Daftar Akun Premium" className="mt-8 max-w-5xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-md mt-6">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="text-xl font-extrabold text-gray-900 mb-2">Produk Tidak Ditemukan</p>
              <p className="text-sm text-gray-500 mb-4">Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
              {searchQuery && (
                <Link href="/" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-xs font-extrabold transition-colors shadow-md">
                  Hapus Pencarian
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => {
                const imageUrl = product.image || product.icon;

                return (
                  <Link
                    href={`/${product.slug}`}
                    key={product.slug}
                    title={`Beli Akun Premium ${product.brandName}`}
                    className="group block h-full"
                  >
                    <article className="relative h-full bg-white border border-gray-100 p-3.5 sm:p-5 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 flex flex-col justify-between text-center shadow-md shadow-gray-200/40">

                      {/* Kontainer Gambar & Badge Atas */}
                      <div className="relative w-full aspect-square rounded-2xl bg-slate-50 border border-gray-100 p-2 sm:p-3 flex items-center justify-center mb-3">
                        {/* Badge Type/Auto */}
                        <span className="absolute top-2 right-2 bg-indigo-50 text-indigo-700 border border-indigo-100/80 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          {product.type || 'AUTO'}
                        </span>

                        {/* Logo Produk */}
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center text-gray-800 text-2xl font-black relative">
                          {imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={imageUrl}
                              alt={`Beli Akun Premium ${product.brandName}`}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            product.brandName.charAt(0)
                          )}
                        </div>
                      </div>

                      {/* Detail Teks Terpusat */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase mb-1">
                          DESAIN & MEDIA
                        </span>

                        <h2 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                          {product.brandName}
                        </h2>

                        {/* Kotak Harga Terbungkus Rapi */}
                        <div className="w-full mt-1 py-2 px-2 bg-indigo-50/60 border border-indigo-100/80 rounded-xl text-center">
                          <span className="text-[10px] text-gray-500 block font-bold">Mulai dari</span>
                          <p className="text-xs sm:text-sm font-black text-indigo-700">
                            Rp {product.minPrice.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}