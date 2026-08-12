// app/blog/page.tsx
import Link from 'next/link';

const blogPosts = [
  {
    id: '1',
    slug: 'cara-aman-beli-akun-premium-legal-2026',
    title: 'Cara Aman Membeli Akun Premium Legal Anti Banned di 2026',
    excerpt: 'Jangan asal beli! Panduan lengkap cara memilih layanan pihak ketiga yang terpercaya agar akun Netflix dan Spotify Anda awet, legal, dan terhindar dari banned.',
    category: 'Edukasi',
    date: '12 Agustus 2026',
    author: 'Admin Ornot',
    imageUrl: 'https://placehold.co/800x500/4f46e5/ffffff?text=Akun+Premium+Aman&font=Montserrat',
  },
  {
    id: '2',
    slug: 'solusi-netflix-sharing-anti-screen-limit',
    title: 'Solusi Netflix Sharing Anti Screen Limit (Household Update)',
    excerpt: 'Sering kena peringatan "Your device isn\'t part of the Netflix Household"? Berikut adalah trik aman dan legal untuk mengatasi batas layar saat sharing akun.',
    category: 'Tips & Trik',
    date: '10 Agustus 2026',
    author: 'Tech Team',
    imageUrl: 'https://placehold.co/800x500/e50914/ffffff?text=Netflix+Sharing&font=Montserrat',
  },
  {
    id: '3',
    slug: 'perbedaan-spotify-premium-vs-free',
    title: 'Perbedaan Spotify Premium vs Free: Yakin Masih Mau Denger Iklan?',
    excerpt: 'Kupas tuntas 5 keuntungan utama berlangganan Spotify Premium dibandingkan versi gratis. Mulai dari kualitas audio hingga fitur download offline.',
    category: 'Review',
    date: '8 Agustus 2026',
    author: 'Reviewer Ornot',
    imageUrl: 'https://placehold.co/800x500/1db954/ffffff?text=Spotify+Premium&font=Montserrat',
  },
  {
    id: '4',
    slug: 'promo-kemerdekaan-akun-premium-diskon',
    title: 'Promo Spesial Kemerdekaan! Diskon Akun Premium Hingga 50%',
    excerpt: 'Rayakan bulan kemerdekaan dengan diskon besar-besaran di Ornot Prem. Klaim kode promonya sekarang untuk langganan Canva Pro dan YouTube Premium.',
    category: 'Promo',
    date: '5 Agustus 2026',
    author: 'Marketing Team',
    imageUrl: 'https://placehold.co/800x500/ef4444/ffffff?text=Promo+Kemerdekaan&font=Montserrat',
  },
  {
    id: '5',
    slug: 'keuntungan-canva-pro-untuk-desainer-pemula',
    title: '7 Keuntungan Canva Pro untuk Desainer Pemula & UMKM',
    excerpt: 'Mengapa Anda wajib upgrade ke Canva Pro? Temukan fitur rahasia seperti Background Remover dan Brand Kit yang akan mempercepat proses desain Anda.',
    category: 'Tutorial',
    date: '2 Agustus 2026',
    author: 'Design Team',
    imageUrl: 'https://placehold.co/800x500/00c4cc/ffffff?text=Canva+Pro&font=Montserrat',
  },
  {
    id: '6',
    slug: 'penyebab-akun-premium-sering-bermasalah',
    title: 'Kenapa Akun Premium Pihak Ketiga Sering Bermasalah? Ini Jawabannya',
    excerpt: 'Pernah beli akun lalu seminggu kemudian tidak bisa login? Pahami bedanya akun trial curian dengan akun legal bergaransi resmi dari Ornot Prem.',
    category: 'Edukasi',
    date: '28 Juli 2026',
    author: 'Admin Ornot',
    imageUrl: 'https://placehold.co/800x500/f59e0b/ffffff?text=Edukasi+Premium&font=Montserrat',
  },
  {
    id: '7',
    slug: 'cara-berlangganan-youtube-premium-murah',
    title: 'Cara Berlangganan YouTube Premium Tanpa Iklan Lebih Murah',
    excerpt: 'Nonton YouTube bebas iklan tanpa harus bayar mahal. Simak perbandingan harga paket family vs individual dan cara mendapatkan harga termurah.',
    category: 'Tips & Trik',
    date: '25 Juli 2026',
    author: 'Tech Team',
    imageUrl: 'https://placehold.co/800x500/ff0000/ffffff?text=YouTube+Premium&font=Montserrat',
  },
  {
    id: '8',
    slug: 'chatgpt-plus-vs-claude-pro-terbaik-2026',
    title: 'ChatGPT Plus vs Claude Pro: Mana AI Premium Terbaik di 2026?',
    excerpt: 'Bagi Anda pekerja digital, memilih layanan AI premium sangatlah penting. Kami menguji performa ChatGPT Plus dan Claude Pro untuk coding dan penulisan.',
    category: 'Review',
    date: '20 Juli 2026',
    author: 'Dev Team',
    imageUrl: 'https://placehold.co/800x500/10a37f/ffffff?text=ChatGPT+vs+Claude&font=Montserrat',
  },
  {
    id: '9',
    slug: 'cara-langganan-capcut-pro-murah',
    title: 'Cara Langganan CapCut Pro Murah untuk Editor TikTok & Reels',
    excerpt: 'Ingin pakai efek dan transisi premium yang lagi viral? Temukan cara mendapatkan akun CapCut Pro dengan harga terjangkau, legal, dan aman 100%.',
    category: 'Tutorial',
    date: '15 Juli 2026',
    author: 'Video Editor',
    imageUrl: 'https://placehold.co/800x500/000000/ffffff?text=CapCut+Pro&font=Montserrat',
  },
  {
    id: '10',
    slug: 'disney-plus-vs-netflix-terbaik-2026',
    title: 'Disney+ Hotstar vs Netflix: Mana yang Lebih Worth It di 2026?',
    excerpt: 'Bingung memilih antara Marvel Cinematic Universe di Disney+ atau series original Netflix? Cek perbandingan harga, katalog film, dan kualitas 4K di sini.',
    category: 'Review',
    date: '10 Juli 2026',
    author: 'Movie Geek',
    imageUrl: 'https://placehold.co/800x500/001489/ffffff?text=Disney+Plus&font=Montserrat',
  },
  {
    id: '11',
    slug: 'peluang-bisnis-reseller-akun-premium',
    title: 'Peluang Bisnis Reseller Akun Premium, Untung Jutaan Per Bulan!',
    excerpt: 'Ingin mulai bisnis digital tanpa ribet stok barang? Bergabunglah menjadi reseller di Ornot Prem. Dapatkan harga khusus dengan margin keuntungan maksimal.',
    category: 'Edukasi',
    date: '5 Juli 2026',
    author: 'Ornot Group',
    imageUrl: 'https://placehold.co/800x500/8b5cf6/ffffff?text=Peluang+Reseller&font=Montserrat',
  },
  {
    id: '12',
    slug: 'top-up-saldo-qris-otomatis-cepat',
    title: 'Kemudahan Top Up Saldo via QRIS Otomatis, Masuk Dalam 5 Detik!',
    excerpt: 'Beli akun premium kini makin gampang. Ornot Prem mendukung pembayaran QRIS otomatis (Gopay, OVO, Dana, ShopeePay, M-Banking) tanpa perlu konfirmasi manual admin.',
    category: 'Update Info',
    date: '1 Juli 2026',
    author: 'Dev Team',
    imageUrl: 'https://placehold.co/800x500/0ea5e9/ffffff?text=QRIS+Otomatis&font=Montserrat',
  },
  {
    id: '13',
    slug: 'manfaat-grammarly-premium-untuk-mahasiswa',
    title: 'Kenapa Mahasiswa & Pekerja Wajib Pakai Grammarly Premium?',
    excerpt: 'Jangan sampai skripsi atau email kerjaan Anda terlihat tidak profesional karena grammar berantakan. Lihat bedanya Grammarly versi gratis dan premium.',
    category: 'Edukasi',
    date: '25 Juni 2026',
    author: 'Copywriter Team',
    imageUrl: 'https://placehold.co/800x500/15c39a/ffffff?text=Grammarly+Premium&font=Montserrat',
  },
  {
    id: '14',
    slug: 'bahaya-microsoft-office-crack-vs-original',
    title: 'Bahaya Microsoft Office Crack! Beralihlah ke Office 365 Original',
    excerpt: 'Masih pakai Word dan Excel bajakan (KMS Pico)? Waspada serangan Ransomware pencuri data! Beralihlah ke Microsoft 365 Original dengan harga patungan yang jauh lebih hemat.',
    category: 'Tips & Trik',
    date: '18 Juni 2026',
    author: 'Tech Team',
    imageUrl: 'https://placehold.co/800x500/d83b01/ffffff?text=Office+365+Original&font=Montserrat',
  }
];
export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Ornot<span className="text-indigo-400">Blog</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Kumpulan informasi terbaru, panduan, promo, dan tips seputar akun premium & layanan Ornot Prem.
        </p>
      </div>

      {/* BLOG GRID SECTION */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <article 
            key={post.id} 
            className="bg-[#1e293b] rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden group hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* THUMBNAIL IMAGE */}
            <Link href={`/blog/${post.slug}`} className="block relative h-52 w-full overflow-hidden bg-slate-800">
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent z-10"></div>
              {/* Image */}
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Category Badge */}
              <div className="absolute top-4 left-4 z-20">
                <span className="bg-indigo-500/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-lg">
                  {post.category}
                </span>
              </div>
            </Link>

            {/* CONTENT */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center text-[11px] text-slate-400 font-medium mb-3 gap-2">
                <span>{post.date}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span>{post.author}</span>
              </div>
              
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-bold text-white leading-snug mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {post.title}
                </h2>
              </Link>
              
              <p className="text-sm text-slate-400 mb-6 line-clamp-3 flex-1">
                {post.excerpt}
              </p>
              
              {/* ACTION BUTTON */}
              <Link 
                href={`/blog/${post.slug}`} 
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors w-fit group/btn"
              >
                Baca Selengkapnya
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* FOOTER CALL TO ACTION */}
      <div className="max-w-3xl mx-auto mt-20 p-8 bg-gradient-to-br from-indigo-900/40 to-[#1e293b] border border-indigo-500/20 rounded-3xl text-center">
        <h3 className="text-xl font-bold text-white mb-2">Belum menemukan yang Anda cari?</h3>
        <p className="text-sm text-slate-400 mb-6">Hubungi admin kami untuk pertanyaan lebih lanjut seputar layanan Ornot Prem.</p>
        <a 
          href="https://wa.me/+6285724486120" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors shadow-lg shadow-indigo-500/25"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          Chat WhatsApp Admin
        </a>
      </div>

    </div>
  );
}