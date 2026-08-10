// app/about/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

// --- SEO METADATA ---
export const metadata: Metadata = {
  title: 'Tentang Kami | ORNOT PREM - Solusi Akun Premium Otomatis',
  description: 'Mengenal ORNOT PREM, penyedia layanan akun premium otomatis terpercaya dengan garansi penuh dan dukungan pelanggan 24/7.',
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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 pb-24">
      
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        
        {/* Header Section */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-6">
            Mengenal Kami
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ORNOT PREM</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Kami hadir untuk memudahkan Anda menikmati layanan digital premium dengan harga yang jauh lebih terjangkau, aman, dan tanpa ribet.
          </p>
        </header>

        {/* Content Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-10 text-gray-300 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Visi Kami</h2>
            <p>
              Visi kami adalah menjadi platform penyedia layanan digital premium nomor satu di Indonesia yang mengutamakan kecepatan, keamanan, dan kepuasan pelanggan melalui sistem otomatisasi yang efisien.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-3">Mengapa Memilih Kami?</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✅ <strong>Otomatis:</strong> Pesanan diproses dalam hitungan detik setelah pembayaran.</li>
                <li>✅ <strong>Garansi:</strong> Jaminan layanan aktif penuh selama masa langganan.</li>
                <li>✅ <strong>Terpercaya:</strong> Transaksi aman dengan sistem pembayaran terverifikasi.</li>
                <li>✅ <strong>Support:</strong> Layanan pelanggan siap membantu 24/7 via WhatsApp.</li>
              </ul>
            </div>
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-3">Komitmen Kami</h3>
              <p className="text-sm text-gray-400">
                Kami berkomitmen untuk terus memperluas pilihan produk digital dan menjaga kualitas layanan agar tetap menjadi pilihan utama Anda dalam memenuhi kebutuhan hiburan dan alat produktivitas premium.
              </p>
            </div>
          </section>

          <section className="border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Keamanan Anda Prioritas Kami</h2>
            <p>
              Setiap data yang Anda masukkan ke platform kami dikelola dengan standar keamanan tinggi. Kami tidak pernah menyimpan data sensitif yang tidak diperlukan, dan kami selalu memperbarui sistem kami untuk melindungi Anda dari segala ancaman siber.
            </p>
          </section>

        </div>

        {/* Closing CTA */}
        <footer className="mt-12 text-center">
          <p className="text-gray-500 mb-6 italic">&ldquo;Premium experience, affordable price.&rdquo;</p>
          <Link href="/" className="inline-block bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-cyan-400 transition-all shadow-lg">
            Mulai Belanja Sekarang
          </Link>
        </footer>

      </main>
    </div>
  );
}