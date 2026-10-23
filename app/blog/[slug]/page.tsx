// app/blog/[slug]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const blogPosts = [
  {
    id: '1',
    slug: 'cara-aman-beli-akun-premium-legal-2026',
    title: 'Cara Aman Membeli Akun Premium Legal Anti Banned di 2026',
    excerpt: 'Jangan asal beli! Panduan lengkap cara memilih layanan pihak ketiga yang terpercaya agar akun Netflix dan Spotify Anda awet, legal, dan terhindar dari banned.',
    content: `
      <h2>Kenapa Akun Premium Sering Banned?</h2>
      <p>Banyak penjual nakal di luar sana yang menggunakan metode "Trial", curian (carding), atau aplikasi modifikasi. Hal ini sangat dilarang oleh pihak resmi seperti Netflix atau Spotify dan akan berujung pada akun yang dinonaktifkan secara sepihak.</p>
      <h2>Tips Memilih Penjual yang Aman</h2>
      <ul>
        <li><strong>Pastikan Sistem Legal:</strong> Tanyakan apakah mereka menggunakan sistem Family Plan resmi atau metode berlangganan mandiri.</li>
        <li><strong>Cek Testimoni Asli:</strong> Jangan hanya percaya pada ulasan teks, cek juga screenshot riwayat transaksi dari pembeli sebelumnya.</li>
        <li><strong>Garansi Penuh:</strong> Pilihlah toko yang berani memberikan garansi full selama masa langganan berjalan.</li>
      </ul>
      <p>Di <strong>Ornot Prem</strong>, kami menjamin 100% semua akun didaftarkan melalui jalur resmi, sehingga Anda bebas dari rasa khawatir akun <em>banned</em> di tengah jalan.</p>
    `,
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
    content: `
      <h2>Apa itu Aturan Netflix Household?</h2>
      <p>Netflix memperketat kebijakan berbaginya. Sistem mereka melacak IP Address dan ID Perangkat (TV) untuk memastikan akun hanya digunakan dalam satu rumah tangga yang sama.</p>
      <h2>Cara Mengatasinya Secara Legal</h2>
      <ol>
        <li><strong>Gunakan Perangkat Mobile:</strong> Aturan <em>Household</em> saat ini paling ketat diterapkan pada Smart TV. Jika Anda menggunakan HP, Tablet, atau Laptop (via web browser), peringatan ini lebih jarang muncul.</li>
        <li><strong>Verifikasi Kode Sementara:</strong> Netflix memberikan opsi verifikasi via email/SMS. Jika Anda berlangganan melalui layanan terpercaya seperti Ornot Prem, tim admin akan selalu siaga membantu memberikan kode OTP tersebut.</li>
        <li><strong>Jangan Menonton Bersamaan (Screen Limit):</strong> Akun Premium Netflix maksimal hanya bisa memutar di 4 layar secara bersamaan. Patuhilah jam tayang dan kesepakatan bersama pembeli lain.</li>
      </ol>
    `,
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
    content: `
      <h2>Apakah Berlangganan Spotify Premium Sepadan?</h2>
      <p>Jika Anda menghabiskan lebih dari 2 jam sehari mendengarkan musik atau <em>podcast</em>, jawabannya adalah <strong>Sangat Sepadan!</strong></p>
      <h2>5 Keunggulan Spotify Premium:</h2>
      <ul>
        <li><strong>Bebas Iklan (Ad-Free):</strong> Tidak ada lagi iklan audio menjengkelkan yang merusak suasana hati di tengah <em>playlist</em> favorit Anda.</li>
        <li><strong>Download & Dengarkan Offline:</strong> Hemat kuota! Anda bisa mengunduh ribuan lagu dan memutarnya saat sedang tidak ada sinyal internet.</li>
        <li><strong>Skip Tanpa Batas:</strong> Anda bebas melewatkan (<em>skip</em>) lagu yang tidak Anda suka kapan saja.</li>
        <li><strong>Pilih Lagu Sesuka Hati:</strong> Tidak ada lagi mode acak (<em>shuffle</em>) paksaan.</li>
        <li><strong>Kualitas Audio Maksimal:</strong> Nikmati musik dengan <em>bitrate</em> hingga 320 kbps (jauh lebih jernih dan detail dibanding versi gratis).</li>
      </ul>
    `,
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
    content: `
      <h2>MERDEKA DARI IKLAN!</h2>
      <p>Di bulan Agustus ini, Ornot Prem mengadakan promo spesial untuk menyambut Hari Kemerdekaan RI.</p>
      <h2>Diskon yang Tersedia:</h2>
      <ul>
        <li><strong>Canva Pro 1 Tahun:</strong> Diskon 50% untuk kuota 50 pembeli pertama.</li>
        <li><strong>YouTube Premium Family:</strong> Beli 3 bulan, dapat tambahan gratis 1 bulan!</li>
        <li><strong>Netflix Sharing (4K UHD):</strong> Potongan harga khusus untuk pelanggan yang memperpanjang (<em>extend</em>) langganannya.</li>
      </ul>
      <p>Langsung chat admin kami di WhatsApp dan sebutkan kode voucher: <strong>MERDEKA2026</strong>. Promo ini sangat terbatas!</p>
    `,
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
    content: `
      <h2>Desain Profesional dalam Hitungan Menit</h2>
      <p>Bagi UMKM, konten sosial media adalah ujung tombak penjualan. Canva Pro memungkinkan Anda membuat visual setara agensi profesional tanpa harus jago Photoshop.</p>
      <h2>Fitur Andalan Canva Pro:</h2>
      <ol>
        <li><strong>Background Remover:</strong> Hapus latar belakang foto produk Anda hanya dengan satu klik.</li>
        <li><strong>Akses Jutaan Aset Premium:</strong> Gunakan ribuan elemen grafis, foto, dan video premium tanpa watermark.</li>
        <li><strong>Magic Resize:</strong> Ubah ukuran desain dari Instagram Square langsung ke format Story tanpa repot.</li>
        <li><strong>Brand Kit:</strong> Simpan logo, palet warna, dan font resmi perusahaan Anda.</li>
      </ol>
    `,
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
    content: `
      <h2>Hati-hati Akun Ilegal</h2>
      <p>Akun yang sering logout sendiri atau minta ubah password biasanya berasal dari metode ilegal. Di Ornot Prem, kami memastikan keamanan akun Anda dengan garansi 100%.</p>
    `,
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
    content: `
      <h2>Nonton Tanpa Gangguan</h2>
      <p>Bergabung dengan Family Plan adalah cara paling hemat untuk menikmati YouTube Premium. Ornot Prem menyediakan slot Family Plan resmi dengan harga terjangkau.</p>
    `,
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
    content: `
      <h2>Komparasi AI Terbaik</h2>
      <p>Keduanya memiliki keunggulan masing-masing. ChatGPT unggul di integrasi ekosistem, sementara Claude Pro sangat brilian dalam memahami teks panjang dan penulisan natural.</p>
    `,
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
    content: `
      <h2>Edit Video Kelas Profesional</h2>
      <p>Dengan CapCut Pro, Anda membuka akses ke ribuan template, efek, dan transisi berbayar yang akan membuat video Anda lebih berpeluang masuk FYP.</p>
    `,
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
    content: `
      <h2>Pilih Mana?</h2>
      <p>Jika Anda suka film keluarga dan superhero, Disney+ adalah jawabannya. Tapi jika Anda pencinta series binge-watching, Netflix tetap tak terkalahkan.</p>
    `,
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
    content: `
      <h2>Bisnis Produk Digital Berkelanjutan</h2>
      <p>Aplikasi dan layanan streaming telah menjadi kebutuhan harian masyarakat. Memulai usaha produk digital kini semakin mudah dengan sistem pengiriman otomatis dan garansi terjamin dari Ornot Prem.</p>
    `,
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
    content: `
      <h2>Sistem Pembayaran Canggih Ornot Prem</h2>
      <p>Kami memahami bahwa menunggu verifikasi pembayaran manual itu membosankan. Oleh karena itu, kami telah melakukan peningkatan sistem secara masif.</p>
      <p>Kini Anda cukup <em>scan</em> kode QRIS, dan transaksi Anda diproses secara otomatis dalam hitungan detik!</p>
    `,
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
    content: `
      <h2>Menulis Bahasa Inggris dengan Pede</h2>
      <p>Grammarly Premium tidak hanya mengecek typo, tapi juga menyarankan penyusunan ulang kalimat (<em>sentence rewrite</em>) agar tulisan Anda lebih luwes dan natural.</p>
    `,
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
    content: `
      <h2>Sayangi Data Anda</h2>
      <p>Aplikasi crack sering kali disisipi malware atau ransomware yang bisa mengunci seluruh file di laptop Anda. Gunakan lisensi resmi Office 365 dari Ornot Prem, aman dan murah.</p>
    `,
    category: 'Tips & Trik',
    date: '18 Juni 2026',
    author: 'Tech Team',
    imageUrl: 'https://placehold.co/800x500/d83b01/ffffff?text=Office+365+Original&font=Montserrat',
  }
];

// --- DYNAMIC METADATA GENERATOR ---
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> | { slug: string } 
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);

  if (!post) {
    return {
      title: 'Artikel Tidak Ditemukan | ORNOT PREM',
    };
  }

  return {
    title: `${post.title} | ORNOT PREM`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://ornotprem.my.id/blog/${post.slug}`,
      siteName: 'Ornot Prem',
      images: [{ url: post.imageUrl }],
      locale: 'id_ID',
      type: 'article',
    },
  };
}

export default async function BlogPostDetail({ 
  params 
}: { 
  params: Promise<{ slug: string }> | { slug: string } 
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-24">
      
      {/* Background Soft Glow Aksen Indigo-Purple */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Navigation Back */}
        <div className="mb-6">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-extrabold text-xs sm:text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Semua Artikel
          </Link>
        </div>

        {/* Article Header Card */}
        <article className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl shadow-gray-200/50">
          
          <header className="mb-8 text-center max-w-3xl mx-auto">
            <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-black uppercase tracking-wider py-1.5 px-4 rounded-full mb-4 border border-indigo-100">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-bold text-gray-400">
              <span>{post.date}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span className="text-gray-600">{post.author}</span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="w-full h-52 sm:h-72 md:h-96 rounded-2xl sm:rounded-3xl overflow-hidden mb-8 shadow-md border border-gray-100">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Article Typography Body */}
          <div 
            className="prose prose-slate prose-indigo max-w-none 
              prose-headings:font-black prose-headings:text-gray-900 prose-headings:tracking-tight 
              prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 sm:prose-h2:mt-10 prose-h2:mb-3 sm:prose-h2:mb-4 
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4 sm:prose-p:mb-6 
              prose-a:text-indigo-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-indigo-800
              prose-strong:text-gray-900 prose-strong:font-black
              prose-ul:list-disc prose-ul:pl-5 sm:prose-ul:pl-6 prose-li:text-gray-600 prose-li:mb-2
              prose-ol:list-decimal prose-ol:pl-5 sm:prose-ol:pl-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Bottom CTA Card */}
          <div className="mt-12 sm:mt-16 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center shadow-sm">
            <h3 className="text-lg sm:text-2xl font-black text-gray-900 mb-2">Butuh Akun Premium Cepat & Bergaransi?</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-6 max-w-md mx-auto">
              Nikmati kemudahan beli akun premium resmi dengan proses otomatis 24/7 di Ornot Prem.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link 
                href="/" 
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold py-3 px-8 rounded-xl sm:rounded-2xl shadow-md shadow-indigo-600/20 text-xs sm:text-sm transition-all"
              >
                Lihat Katalog Produk
              </Link>
              <a 
                href="https://wa.me/62895402137562" 
                target="_blank" 
                rel="noreferrer" 
                className="w-full sm:w-auto bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-extrabold py-3 px-8 rounded-xl sm:rounded-2xl shadow-sm text-xs sm:text-sm transition-all flex justify-center items-center gap-2"
              >
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Tanya Admin WhatsApp
              </a>
            </div>
          </div>

        </article>

      </main>
    </div>
  );
}