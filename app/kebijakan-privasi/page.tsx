// app/kebijakan-privasi/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';

// --- TAMBAHAN SEO METADATA ---
export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Ornot Prem',
  description: 'Komitmen ORNOT PREM dalam melindungi keamanan, kerahasiaan data pribadi, dan transaksi Anda.',
  keywords: ['kebijakan privasi ornot prem', 'privacy policy', 'keamanan data pengguna'],
  openGraph: {
    title: 'Kebijakan Privasi - Ornot Prem',
    description: 'Pelajari bagaimana kami melindungi data dan privasi Anda.',
    url: 'https://ornotprem.my.id/kebijakan-privasi',
    siteName: 'Ornot Prem',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 pb-24">
      
      {/* Efek Cahaya Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Halaman */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-4">
            Keamanan & Privasi Pengguna
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Di <strong>ORNOT PREM</strong>, privasi dan keamanan data Anda adalah prioritas utama kami. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
          </p>
        </div>

        {/* Konten Kebijakan Privasi */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-8 text-gray-300 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-cyan-400">01.</span> Informasi yang Kami Kumpulkan
            </h2>
            <p className="mb-3">
              Kami hanya mengumpulkan informasi yang diperlukan secara wajar untuk memproses pesanan dan memberikan layanan terbaik kepada Anda, meliputi:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Informasi kontak dasar seperti nomor WhatsApp atau alamat email untuk pengiriman produk digital dan konfirmasi pesanan.</li>
              <li>Data transaksi pembayaran yang diproses secara aman melalui gateway pembayaran resmi.</li>
              <li>Riwayat pembelian untuk keperluan verifikasi garansi dan layanan pelanggan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-cyan-400">02.</span> Penggunaan Informasi
            </h2>
            <p>
              Informasi yang Anda berikan digunakan murni untuk keperluan operasional layanan, seperti mengirimkan detail akun/pesanan digital, memproses klaim garansi, memberikan dukungan teknis via WhatsApp, serta meningkatkan kualitas performa website ORNOT PREM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-cyan-400">03.</span> Kerahasiaan & Keamanan Data
            </h2>
            <p>
              Kami berkomitmen menjaga kerahasiaan data pribadi Anda. ORNOT PREM tidak pernah memperjualbelikan, menyewakan, atau mendistribusikan data pribadi Anda kepada pihak ketiga mana pun tanpa izin eksplisit dari Anda, kecuali diwajibkan oleh hukum yang berlaku di Indonesia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-cyan-400">04.</span> Penggunaan Cookie
            </h2>
            <p>
              Website kami menggunakan cookie dan teknologi penyimpanan lokal standar untuk mengingat preferensi Anda (seperti filter kategori atau status sesi) guna memastikan pengalaman menjelajah web Anda tetap lancar dan nyaman.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-cyan-400">05.</span> Perubahan Kebijakan Privasi
            </h2>
            <p>
              Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu seiring dengan perkembangan fitur website atau regulasi yang berlaku. Setiap perubahan akan langsung dipublikasikan pada halaman ini.
            </p>
          </section>

          <section className="pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">Ada Pertanyaan Seputar Privasi?</h2>
            <p className="text-sm text-gray-400 mb-4">
              Jika Anda memiliki pertanyaan, keraguan, atau permintaan penghapusan data pribadi, silakan hubungi tim kami melalui halaman kontak resmi.
            </p>
            <Link 
              href="/kontak" 
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-cyan-400 font-bold px-6 py-3 rounded-full transition-colors text-sm"
            >
              Hubungi Kami
            </Link>
          </section>

        </div>

      </main>
    </div>
  );
}