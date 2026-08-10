// app/syarat-ketentuan/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';

// --- TAMBAHAN SEO METADATA ---
export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan | Ornot Prem',
  description: 'Baca aturan main, kebijakan garansi, dan ketentuan pembelian produk digital di ORNOT PREM.',
  keywords: ['syarat dan ketentuan ornot prem', 'terms of service', 'kebijakan garansi akun premium'],
  openGraph: {
    title: 'Syarat & Ketentuan - Ornot Prem',
    description: 'Ketentuan layanan dan garansi produk digital di Ornot Prem.',
    url: 'https://ornotprem.my.id/syarat-ketentuan',
    siteName: 'Ornot Prem',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 pb-24">
      
      {/* Efek Cahaya Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Header Halaman (Typo rounded-[2.5p_rem] sudah diperbaiki menjadi rounded-[2.5rem]) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-4">
            Legal & Ketentuan Layanan
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Syarat & Ketentuan
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Harap baca syarat dan ketentuan ini dengan seksama sebelum melakukan transaksi atau pembelian produk digital di ORNOT PREM.
          </p>
        </div>

        {/* Konten Syarat & Ketentuan */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-8 text-gray-300 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-cyan-400">01.</span> Ketentuan Umum
            </h2>
            <p>
              Dengan mengakses dan melakukan transaksi di website <strong>ORNOT PREM</strong>, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan yang tertulis di halaman ini. Kami berhak mengubah isi ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-cyan-400">02.</span> Layanan & Produk Digital
            </h2>
            <p>
              ORNOT PREM menyediakan layanan penjualan akun premium dan alat digital pihak ketiga (seperti aplikasi streaming, desain, AI, dan tools produktivitas). Kami bertindak sebagai penyedia layanan dan reseller resmi yang menjamin keaktifan produk sesuai dengan masa aktif atau durasi paket yang dibeli.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-cyan-400">03.</span> Sistem Pembayaran & Harga
            </h2>
            <p>
              Semua transaksi dilakukan melalui sistem pembayaran otomatis yang terverifikasi. Harga tertera pada website sudah final (termasuk penyesuaian layanan reseller) dan dapat berubah sewaktu-waktu mengikuti kebijakan penyedia pusat tanpa pemberitahuan terlebih dahulu.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-cyan-400">04.</span> Kebijakan Garansi & Pengembalian
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>Garansi berlaku penuh selama masa aktif produk yang dibeli (selama pembeli tidak melanggar aturan akun).</li>
              <li>Garansi otomatis batal jika pembeli melanggar ketentuan akun (contoh: mengubah email/password akun bersama, membagikan akses ke orang lain, atau melanggar terms of service aplikasi asli).</li>
              <li>Pengembalian dana (refund) hanya diberikan jika akun mengalami kendala fatal di awal pembelian dan tim kami gagal melakukan perbaikan atau penggantian akun baru.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-cyan-400">05.</span> Tanggung Jawab Pengguna
            </h2>
            <p>
              Pengguna dilarang keras menggunakan produk yang dibeli dari ORNOT PREM untuk tindakan yang melanggar hukum yang berlaku di wilayah Republik Indonesia. Segala bentuk penyalahgunaan akun di luar kendali kami sepenuhnya merupakan tanggung jawab pengguna.
            </p>
          </section>

          <section className="pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">Butuh Bantuan Lebih Lanjut?</h2>
            <p className="text-sm text-gray-400 mb-4">
              Jika Anda memiliki pertanyaan seputar syarat dan ketentuan ini, silakan hubungi tim dukungan kami melalui halaman kontak atau media sosial resmi kami.
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