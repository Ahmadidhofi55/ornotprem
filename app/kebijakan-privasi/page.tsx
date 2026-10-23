// app/kebijakan-privasi/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';

// --- SEO METADATA ---
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
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-24">
      
      {/* Background Soft Glow Aksen Indigo-Purple */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Header Halaman */}
        <header className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Keamanan & Privasi Pengguna
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            Kebijakan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">Privasi</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg font-medium">
            Di <strong className="text-gray-900">ORNOT PREM</strong>, privasi dan keamanan data Anda adalah prioritas utama kami. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
          </p>
        </header>

        {/* Konten Kebijakan Privasi */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl shadow-gray-200/50 space-y-8 text-gray-600 font-medium leading-relaxed">
          
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2.5">
              <span className="text-indigo-600 font-black text-lg">01.</span> Informasi yang Kami Kumpulkan
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600 mb-3">
              Kami hanya mengumpulkan informasi yang diperlukan secara wajar untuk memproses pesanan dan memberikan layanan purna jual terbaik kepada Anda, meliputi:
            </p>
            <ul className="space-y-2.5 text-sm sm:text-base text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                <span>Informasi kontak dasar seperti nomor WhatsApp untuk pengiriman detail akun digital dan konfirmasi pesanan instan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                <span>Data transaksi pembayaran yang diproses secara otomatis dan aman melalui payment gateway terverifikasi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                <span>Riwayat transaksi untuk keperluan validasi garansi dan bantuan purna jual.</span>
              </li>
            </ul>
          </section>

          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2.5">
              <span className="text-indigo-600 font-black text-lg">02.</span> Penggunaan Informasi
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              Informasi yang Anda berikan digunakan murni untuk keperluan operasional layanan, seperti mengirimkan detail akun/pesanan digital, memproses klaim garansi, memberikan dukungan teknis via WhatsApp, serta meningkatkan performa dan kenyamanan website ORNOT PREM.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2.5">
              <span className="text-indigo-600 font-black text-lg">03.</span> Kerahasiaan & Keamanan Data
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              Kami berkomitmen penuh menjaga kerahasiaan data pribadi Anda. ORNOT PREM tidak pernah memperjualbelikan, menyewakan, atau mendistribusikan data pribadi Anda kepada pihak ketiga mana pun tanpa izin eksplisit dari Anda, kecuali diwajibkan oleh hukum yang berlaku di Republik Indonesia.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2.5">
              <span className="text-indigo-600 font-black text-lg">04.</span> Penggunaan Cookie & Penyimpanan Lokal
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              Website kami menggunakan cookie dan teknologi penyimpanan lokal standar untuk mengingat preferensi Anda (seperti filter pencarian atau status navigasi) guna memastikan pengalaman menjelajah web tetap lancar, cepat, dan nyaman.
            </p>
          </section>

          <section className="pb-2">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2.5">
              <span className="text-indigo-600 font-black text-lg">05.</span> Perubahan Kebijakan Privasi
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu seiring dengan perkembangan fitur website atau regulasi yang berlaku. Setiap perubahan akan langsung dipublikasikan secara transparan pada halaman ini.
            </p>
          </section>

          {/* Bottom CTA Box */}
          <div className="pt-6 border-t border-gray-100 bg-slate-50/80 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-base font-extrabold text-gray-900 mb-1">Ada Pertanyaan Seputar Privasi?</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">
              Jika Anda memiliki pertanyaan, keraguan, atau permintaan bantuan terkait data pribadi, silakan hubungi tim dukungan pelanggan kami.
            </p>
            <Link 
              href="/kontak" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold px-6 py-3 rounded-2xl transition-all shadow-md shadow-indigo-600/20 text-xs sm:text-sm"
            >
              <span>Hubungi Customer Support</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}