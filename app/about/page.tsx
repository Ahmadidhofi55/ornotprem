// app/about/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tentang Kami | ORNOT PREM - Solusi Akun Premium Otomatis',
  description: 'Mengenal ORNOT PREM, platform penyedia layanan akun premium otomatis terpercaya di Indonesia dengan garansi penuh dan proses instant 24/7.',
  keywords: ['tentang kami ornot prem', 'profil ornot prem', 'penyedia akun premium terpercaya', 'layanan akun premium otomatis'],
  openGraph: {
    title: 'Tentang Kami - ORNOT PREM',
    description: 'Kenali visi dan komitmen ORNOT PREM dalam memberikan layanan akun premium terbaik bagi pelanggan di Indonesia.',
    url: 'https://ornotprem.my.id/about',
    siteName: 'Ornot Prem',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-24">
      
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        <header className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Mengenal ORNOT PREM
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4 leading-tight">
            Akses Hiburan & Produktivitas <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
              Tanpa Batas, Lebih Hemat.
            </span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg font-medium max-w-2xl mx-auto">
            ORNOT PREM hadir sebagai platform penyedia aplikasi & akun premium serba otomatis. Kami memangkas biaya langganan mahal agar semua orang bisa menikmati fitur lengkap secara aman & bergaransi.
          </p>
        </header>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl shadow-gray-200/50 space-y-10">
          
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
              Komitmen & Visi Utama
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed text-sm sm:text-base">
              Visi kami adalah menjadi platform penyedia produk digital premium nomor satu di Indonesia yang paling tepercaya. Kami menggabungkan <strong className="text-gray-900">sistem otomatisasi instan 24/7</strong> dengan <strong className="text-gray-900">layanan purna jual bergaransi penuh</strong> demi memberikan pengalaman transaksi secepat belanja di e-commerce terkemuka.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 text-center">
              Mengapa Pengguna Memilih Kami?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold mb-3">
                  ⚡
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-1">Proses Serba Otomatis</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                  Tidak perlu menunggu admin online. Begitu pembayaran QRIS terverifikasi, detail akun langsung dikirim otomatis detik itu juga.
                </p>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold mb-3">
                  🛡️
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-1">Garansi Penuh 100%</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                  Semua transaksi dilindungi jaminan garansi. Jika ada kendala akses selama masa aktif, tim support kami siap membantu atau mengganti akun.
                </p>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold mb-3">
                  💰
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-1">Harga Terjangkau & Transparan</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                  Dapatkan harga terbaik yang transparan tanpa biaya tersembunyi. Pas di kantong untuk semua kebutuhan digital Anda.
                </p>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold mb-3">
                  💬
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-1">Dukungan Support Fast Response</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                  Tim layanan pelanggan kami siap membantu Anda menyelesaikan segala pertanyaan atau kendala seputar produk kapan saja via WhatsApp.
                </p>
              </div>

            </div>
          </section>

          <section className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100 p-6 rounded-2xl">
            <h3 className="text-lg font-extrabold text-indigo-950 mb-2 flex items-center gap-2">
              <span>🔒</span> Keamanan & Privasi Terjamin
            </h3>
            <p className="text-xs sm:text-sm text-indigo-900/80 font-medium leading-relaxed">
              Kami sangat menghargai privasi Anda. Setiap data transaksi disimpan dengan enkripsi aman dan tidak pernah dibagikan kepada pihak ketiga. Pengalaman belanja Anda di ORNOT PREM dijamin tenang, nyaman, dan terproteksi.
            </p>
          </section>

        </div>

        <footer className="mt-12 text-center">
          <p className="text-gray-400 font-semibold text-sm mb-4 italic">
            &ldquo;Pengalaman Premium. Harga Terjangkau. Proses Instan.&rdquo;
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 text-sm"
          >
            <span>Mulai Belanja Sekarang</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </footer>

      </main>
    </div>
  );
}