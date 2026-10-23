// app/blog/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Edukasi | ORNOT PREM',
  description: 'Kumpulan artikel, tips, panduan, dan informasi promo seputar aplikasi serta akun premium terpercaya.',
};

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
    slug: 'peluang-bisnis-layanan-akun-premium',
    title: 'Peluang Usaha Digital Layanan Akun Premium, Untung Jutaan!',
    excerpt: 'Ingin mulai bisnis digital tanpa ribet stok barang? Pelajari cara memulai usaha produk digital dengan dukungan otomatisasi dari Ornot Prem.',
    category: 'Edukasi',
    date: '5 Juli 2026',
    author: 'Ornot Group',
    imageUrl: 'https://placehold.co/800x500/8b5cf6/ffffff?text=Peluang+Digital&font=Montserrat',
  },
  {
    id: '12',
    slug: 'top-up-saldo-qris-otomatis-cepat',
    title: 'Kemudahan Pembayaran via QRIS Otomatis, Masuk Dalam 5 Detik!',
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
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-24">
      
      {/* Background Soft Glow Aksen Indigo-Purple */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* HEADER SECTION */}
        <header className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Pusat Edukasi & Informasi
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4">
            Ornot<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">Blog</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg font-medium max-w-2xl mx-auto">
            Kumpulan panduan, tips trik, promo spesial, dan wawasan terbaru seputar akun & aplikasi premium resmi.
          </p>
        </header>

        {/* BLOG GRID SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article 
              key={post.id} 
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
            >
              {/* THUMBNAIL IMAGE */}
              <Link href={`/blog/${post.slug}`} className="block relative h-52 w-full overflow-hidden bg-slate-100">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider py-1.5 px-3 rounded-full shadow-md">
                    {post.category}
                  </span>
                </div>
              </Link>

              {/* CONTENT */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-xs text-gray-400 font-bold mb-3 gap-2">
                    <span>{post.date}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span>{post.author}</span>
                  </div>
                  
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-lg font-extrabold text-gray-900 leading-snug mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  
                  <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                
                {/* ACTION BUTTON */}
                <Link 
                  href={`/blog/${post.slug}`} 
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors w-fit group/btn"
                >
                  <span>Baca Selengkapnya</span>
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* FOOTER CALL TO ACTION */}
        <div className="max-w-3xl mx-auto mt-20 p-8 sm:p-10 bg-white border border-indigo-100 rounded-3xl text-center shadow-xl shadow-indigo-500/5 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Belum menemukan informasi yang dicari?</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Tim dukungan kami siap membantu menjawab pertanyaan seputar produk dan layanan Ornot Prem.</p>
            <a 
              href="https://wa.me/+62895402137562" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-indigo-600/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat WhatsApp Customer Support
            </a>
          </div>
        </div>

      </main>
    </div>
  );
}