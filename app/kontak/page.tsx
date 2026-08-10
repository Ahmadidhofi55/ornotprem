// app/kontak/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';

// --- TAMBAHAN SEO METADATA ---
export const metadata: Metadata = {
  title: 'Hubungi Kami & Layanan Pelanggan 24/7 | Ornot Prem',
  description: 'Punya kendala pesanan, klaim garansi akun premium, atau ingin kerja sama? Hubungi tim dukungan ORNOT PREM via WhatsApp atau Email.',
  keywords: ['kontak ornot prem', 'hubungi ornot prem', 'whatsapp ornot prem', 'customer service akun premium', 'bantuan ornot prem'],
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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 pb-24">
      
      {/* Efek Cahaya Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Halaman */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-4">
              Layanan Pelanggan 24/7
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Hubungi Kami
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-xl">
              Punya kendala seputar pesanan, garansi akun, atau ingin berkonsultasi? Tim <strong>ORNOT PREM</strong> siap membantu Anda kapan pun dibutuhkan.
            </p>
          </div>
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
            💬
          </div>
        </div>

        {/* Grid Informasi Kontak & Pusat Bantuan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri: Kartu Kontak Cepat (2 Kartu Utama) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Kartu WhatsApp */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl mb-4 group-hover:scale-110 transition-transform">
                📱
              </div>
              <h3 className="text-lg font-bold text-white mb-1">WhatsApp Resmi</h3>
              <p className="text-xs text-gray-400 mb-4">Respon cepat untuk klaim garansi & bantuan transaksi.</p>
              <a 
                href="https://wa.me/6285724486120" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm hover:underline"
              >
                Chat WhatsApp &rarr;
              </a>
            </div>

            {/* Kartu Email */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl mb-4 group-hover:scale-110 transition-transform">
                ✉️
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Email Dukungan</h3>
              <p className="text-xs text-gray-400 mb-4">Untuk kerja sama bisnis atau pertanyaan administratif.</p>
              <span className="text-white font-medium text-sm">support@ornotgroup.my.id</span>
            </div>

            {/* Jam Operasional */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-2xl mb-4">
                ⏰
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Jam Operasional</h3>
              <p className="text-xs text-gray-400">Sistem otomatis berjalan 24/7. Respon admin manual: 09.00 - 22.00 WIB.</p>
            </div>

          </div>

          {/* Kolom Kanan: Panduan & Informasi Bantuan */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Pusat Bantuan & Ketentuan Layanan</h2>
              <p className="text-sm text-gray-400">Informasi penting sebelum Anda menghubungi layanan pelanggan.</p>
            </div>

            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                <h3 className="font-bold text-white mb-1 text-base flex items-center gap-2">
                  <span className="text-cyan-400">1.</span> Cara Transaksi & Pengiriman Akun
                </h3>
                <p className="text-gray-400">
                  Seluruh produk di ORNOT PREM diproses secara otomatis oleh sistem. Setelah pembayaran terverifikasi, detail akun atau instruksi aktivasi akan langsung dikirimkan ke Anda dalam hitungan detik.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                <h3 className="font-bold text-white mb-1 text-base flex items-center gap-2">
                  <span className="text-cyan-400">2.</span> Klaim Garansi & Kendala Akun
                </h3>
                <p className="text-gray-400">
                  Jika Anda mengalami kendala seperti akun error, masa aktif terpotong, atau kendala login, silakan hubungi WhatsApp resmi kami dengan melampirkan <strong>Nomor Pesanan / Bukti Transaksi</strong> untuk proses pengecekan kilat.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                <h3 className="font-bold text-white mb-1 text-base flex items-center gap-2">
                  <span className="text-cyan-400">3.</span> Kerja Sama Reseller / Agen
                </h3>
                <p className="text-gray-400">
                  Bagi Anda yang ingin mengambil kuantiti besar atau bekerja sama lebih lanjut sebagai mitra bisnis jangka panjang, silakan langsung hubungi kontak email atau WhatsApp kami untuk penawaran khusus.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500">Butuh respons cepat? Langsung chat via WhatsApp.</p>
              <a 
                href="https://wa.me/6285724486120" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-6 py-3 rounded-full transition-all text-center text-sm shadow-lg"
              >
                Chat WhatsApp Sekarang
              </a>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}