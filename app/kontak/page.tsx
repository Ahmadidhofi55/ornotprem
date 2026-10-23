// app/kontak/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';

// --- SEO METADATA ---
export const metadata: Metadata = {
  title: 'Hubungi Kami & Layanan Pelanggan 24/7 | Ornot Prem',
  description: 'Punya kendala pesanan, klaim garansi akun premium, atau pertanyaan produk? Hubungi tim dukungan ORNOT PREM via WhatsApp atau Email.',
  keywords: ['contact ornot prem', 'hubungi ornot prem', 'whatsapp ornot prem', 'customer service akun premium', 'bantuan ornot prem'],
  openGraph: {
    title: 'Hubungi Kami - Ornot Prem',
    description: 'Layanan pelanggan siap membantu Anda 24/7 untuk kendala transaksi dan garansi akun.',
    url: 'https://ornotprem.my.id/kontak',
    siteName: 'Ornot Prem',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-24">
      
      {/* Background Soft Glow Aksen Indigo-Purple */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header Halaman */}
        <header className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xl shadow-gray-200/50 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-3 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Layanan Customer Support
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-2">
              Hubungi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">Kami</span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-medium max-w-xl">
              Punya kendala seputar pesanan, klaim garansi, atau pertanyaan produk? Tim <strong className="text-gray-900">ORNOT PREM</strong> siap memberikan bantuan terbaik untuk Anda.
            </p>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-2xl sm:text-3xl text-white shadow-lg shadow-indigo-600/20 shrink-0">
            💬
          </div>
        </header>

        {/* Grid Informasi Kontak & Pusat Bantuan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri: Kartu Kontak Cepat */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Kartu WhatsApp */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xl shadow-gray-200/50 hover:border-emerald-300 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-2xl mb-4 group-hover:scale-105 transition-transform">
                📱
              </div>
              <h3 className="text-base font-extrabold text-gray-900 mb-1">WhatsApp Resmi</h3>
              <p className="text-xs text-gray-500 font-medium mb-4">Respon cepat untuk klaim garansi & bantuan transaksi.</p>
              <a 
                href="https://wa.me/62895402137562" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-extrabold text-xs transition-colors"
              >
                <span>Chat WhatsApp Sekarang</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

            {/* Kartu Email */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xl shadow-gray-200/50 hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl mb-4 group-hover:scale-105 transition-transform">
                ✉️
              </div>
              <h3 className="text-base font-extrabold text-gray-900 mb-1">Email Dukungan</h3>
              <p className="text-xs text-gray-500 font-medium mb-3">Untuk pertanyaan tertulis atau keperluan administratif.</p>
              <span className="text-gray-900 font-mono font-bold text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100 inline-block">
                smg0881@gmail.com
              </span>
            </div>

            {/* Jam Operasional */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xl shadow-gray-200/50">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 text-2xl mb-4">
                ⏰
              </div>
              <h3 className="text-base font-extrabold text-gray-900 mb-1">Jam Operasional</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Pengiriman & verifikasi otomatis berjalan 24/7. Respon admin manual: <strong className="text-gray-800">09.00 - 22.00 WIB</strong>.
              </p>
            </div>

          </div>

          {/* Kolom Kanan: Panduan & Informasi Bantuan */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 space-y-6 flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">Pusat Bantuan & Panduan Layanan</h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Informasi penting sebelum Anda menghubungi customer support.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-gray-100">
                  <h3 className="font-extrabold text-gray-900 mb-1 text-sm sm:text-base flex items-center gap-2">
                    <span className="text-indigo-600 font-black">1.</span> Transaksi & Pengiriman Akun
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                    Seluruh transaksi diproses otomatis oleh sistem. Setelah pembayaran QRIS sukses, detail kredensial akun akan langsung ditampilkan di halaman invoice dan dikirimkan otomatis.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-gray-100">
                  <h3 className="font-extrabold text-gray-900 mb-1 text-sm sm:text-base flex items-center gap-2">
                    <span className="text-indigo-600 font-black">2.</span> Klaim Garansi Penuh
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                    Jika mengalami kendala login atau akses, silakan hubungi WhatsApp resmi kami dengan melampirkan <strong className="text-gray-900">Nomor Invoice (INV-...)</strong> untuk penanganan kilat.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-gray-100">
                  <h3 className="font-extrabold text-gray-900 mb-1 text-sm sm:text-base flex items-center gap-2">
                    <span className="text-indigo-600 font-black">3.</span> Konsultasi Sebelum Membeli
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                    Bingung memilih paket yang sesuai dengan kebutuhan Anda? Jangan ragu untuk bertanya langsung ke admin kami via WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500 font-medium">Butuh respon cepat? Langsung chat via WhatsApp.</p>
              <a 
                href="https://wa.me/62895402137562" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold px-6 py-3 rounded-2xl transition-all text-center text-xs sm:text-sm shadow-md shadow-emerald-600/20 shrink-0"
              >
                Chat WhatsApp Customer Support
              </a>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}