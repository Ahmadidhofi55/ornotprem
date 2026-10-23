// app/syarat-ketentuan/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';

// --- SEO METADATA ---
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
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-24">
      
      {/* Background Soft Glow Aksen Indigo-Purple */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Header Halaman */}
        <header className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Legal & Ketentuan Layanan
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            Syarat & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">Ketentuan</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg font-medium">
            Harap baca syarat dan ketentuan ini dengan seksama sebelum melakukan transaksi atau pembelian produk digital di ORNOT PREM.
          </p>
        </header>

        {/* Konten Syarat & Ketentuan */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl shadow-gray-200/50 space-y-8 text-gray-600 font-medium leading-relaxed">
          
          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2.5">
              <span className="text-indigo-600 font-black text-lg">01.</span> Ketentuan Umum
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              Dengan mengakses dan melakukan transaksi di website <strong className="text-gray-900">ORNOT PREM</strong>, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan yang tertulis di halaman ini. Kami berhak mengubah isi ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2.5">
              <span className="text-indigo-600 font-black text-lg">02.</span> Layanan & Produk Digital
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              ORNOT PREM menyediakan layanan penjualan akun premium dan alat digital (seperti aplikasi streaming, desain, AI, dan tools produktivitas). Kami bertindak sebagai penyedia layanan produk digital terpercaya yang menjamin keaktifan produk sesuai dengan masa aktif atau durasi paket yang dibeli.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2.5">
              <span className="text-indigo-600 font-black text-lg">03.</span> Sistem Pembayaran & Harga
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              Semua transaksi dilakukan melalui sistem pembayaran otomatis yang terverifikasi. Harga yang tertera pada website sudah final dan transparan tanpa biaya tersembunyi, serta dapat menyesuaikan dengan kebijakan penyedia layanan dari waktu ke waktu.
            </p>
          </section>

          <section className="border-b border-gray-100 pb-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2.5">
              <span className="text-indigo-600 font-black text-lg">04.</span> Kebijakan Garansi & Pengembalian
            </h2>
            <ul className="space-y-2.5 text-sm sm:text-base text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                <span>Garansi berlaku penuh selama masa aktif produk yang dibeli (selama pembeli tidak melanggar aturan akun).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                <span>Garansi otomatis batal jika pembeli melanggar ketentuan akun (contoh: mengubah email/password akun bersama, membagikan akses ke orang lain, atau melanggar ketentuan layanan aplikasi asli).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                <span>Pengembalian dana (refund) hanya diberikan jika akun mengalami kendala fatal di awal pembelian dan tim kami gagal melakukan perbaikan atau penggantian akun baru.</span>
              </li>
            </ul>
          </section>

          <section className="pb-2">
            <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2.5">
              <span className="text-indigo-600 font-black text-lg">05.</span> Tanggung Jawab Pengguna
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              Pengguna dilarang keras menggunakan produk yang dibeli dari ORNOT PREM untuk tindakan yang melanggar hukum yang berlaku di wilayah Republik Indonesia. Segala bentuk penyalahgunaan akun di luar kendali kami sepenuhnya merupakan tanggung jawab pengguna.
            </p>
          </section>

          {/* Bottom CTA Box */}
          <div className="pt-6 border-t border-gray-100 bg-slate-50/80 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-base font-extrabold text-gray-900 mb-1">Butuh Bantuan Lebih Lanjut?</h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">
              Jika Anda memiliki pertanyaan seputar syarat dan ketentuan ini, silakan hubungi tim dukungan kami melalui halaman kontak.
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