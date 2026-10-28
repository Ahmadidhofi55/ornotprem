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
  const marginMap: Record<string, number> = {};
  let defaultMargin = 0;

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
      if (Array.isArray(result)) rawProducts = result;
      else if (result?.data) rawProducts = result.data;
      else if (result?.products) rawProducts = result.products;
    }

    if (supabaseRes.data) {
      supabaseRes.data.forEach((s) => {
        if (s.key_name === 'default_margin') {
          defaultMargin = Number(s.value) || 0;
        } else if (s.key_name.startsWith('margin_')) {
          const productId = s.key_name.replace('margin_', '');
          marginMap[productId] = Number(s.value) || 0;
        }
      });
    }
  } catch (e) {
    console.error("Gagal memuat katalog:", e);
  }

  const groupedProductsMap = rawProducts.reduce((acc, product) => {
    const brandName = product.name ? product.name.trim().split(' ')[0] : 'Lainnya';
    const slug = brandName.toLowerCase();

    const productId = String(product.id);
    const basePrice = Number(product.price) || 0;
    const margin = marginMap[productId] !== undefined ? marginMap[productId] : defaultMargin;
    const finalPrice = basePrice > 0 ? basePrice + margin : 0;

    if (!acc[slug]) {
      acc[slug] = { ...product, brandName, slug, minPrice: finalPrice };
    } else if (finalPrice > 0 && (acc[slug].minPrice === 0 || finalPrice < acc[slug].minPrice)) {
      acc[slug].minPrice = finalPrice;
    }
    return acc;
  }, {} as Record<string, GroupedProduct>);

  const filteredProducts = Object.values(groupedProductsMap).filter(p => {
    if (searchQuery && !p.brandName.toLowerCase().includes(searchQuery) && !(p.name || '').toLowerCase().includes(searchQuery)) {
      return false;
    }
    if (activeCategory === 'semua') return true;
    const cat = (p.category || '').toLowerCase();
    const name = (p.name || '').toLowerCase();

    const isApp = name.includes('vpn') || name.includes('ai') || name.includes('chatgpt') || cat.includes('app') || cat.includes('tool');
    const isDesign = name.includes('canva') || name.includes('capcut') || name.includes('adobe') || cat.includes('design') || cat.includes('edit');
    const isStream = name.includes('netflix') || name.includes('spotify') || name.includes('youtube') || cat.includes('stream') || cat.includes('media');

    if (activeCategory === 'apps-tools') return isApp || (!isDesign && !isStream);
    if (activeCategory === 'design-edit') return isDesign && !isApp;
    if (activeCategory === 'stream-media') return isStream && !isApp;
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 selection:bg-indigo-500/20">
      <main className="max-w-7xl mx-auto px-4 pt-4 pb-12">
        <header className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-indigo-700 text-[11px] font-bold uppercase">Proses Otomatis 24/7</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Satu Tempat untuk Semua <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700">
              Langganan Premium Bergaransi
            </span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm max-w-xl">
            Dapatkan akun premium resmi Netflix, Canva, Spotify, dan Viu dengan proses otomatis.
          </p>
        </header>

        <HomeWidgets />

        <section className="mt-8 flex overflow-x-auto gap-2.5 py-2 sm:justify-center scrollbar-none">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === 'semua' ? (searchQuery ? `/?q=${searchQuery}` : '/') : `/?category=${cat.id}${searchQuery ? `&q=${searchQuery}` : ''}`}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                activeCategory === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>{cat.label}
            </Link>
          ))}
        </section>

        <section className="mt-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((p) => (
              <Link href={`/${p.slug}`} key={p.slug} className="group block h-full">
                <article className="h-full bg-white border border-gray-100 p-3.5 sm:p-5 rounded-3xl shadow-md hover:-translate-y-1 hover:border-indigo-200 transition-all flex flex-col justify-between text-center">
                  <div className="w-full aspect-square rounded-2xl bg-slate-50 border p-2 flex items-center justify-center mb-3 relative">
                    <span className="absolute top-2 right-2 bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      {p.type || 'AUTO'}
                    </span>
                    {p.image || p.icon ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.image || p.icon} alt={p.brandName} className="w-16 h-16 object-cover rounded-xl" />
                    ) : (
                      <span className="text-2xl font-black">{p.brandName.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-indigo-600 mb-2">{p.brandName}</h2>
                    <div className="w-full py-1.5 bg-indigo-50/60 rounded-xl">
                      <span className="text-[10px] text-gray-500 font-bold block">Mulai dari</span>
                      <p className="text-xs sm:text-sm font-black text-indigo-700">Rp {p.minPrice.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}