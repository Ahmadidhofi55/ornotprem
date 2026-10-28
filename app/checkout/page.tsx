// app/checkout/page.tsx
"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = searchParams.get('id');
  const productName = searchParams.get('name') || 'Produk Digital';
  const displayPrice = searchParams.get('price') ? Number(searchParams.get('price')) : 0;
  const basePrice = searchParams.get('basePrice') ? Number(searchParams.get('basePrice')) : 0;
  const margin = searchParams.get('margin') ? Number(searchParams.get('margin')) : 0;
  
  const rawImage = searchParams.get('image') || searchParams.get('icon') || searchParams.get('thumbnail') || searchParams.get('img');
  const productImage = rawImage && rawImage !== 'null' && rawImage !== 'undefined' && rawImage !== 'None'
    ? decodeURIComponent(rawImage) 
    : null;

  const [waNumber, setWaNumber] = useState('');
  const [email, setEmail] = useState('');
  const paymentChannel = 'QRIS'; 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanWa = waNumber.trim().replace(/[^0-9]/g, '');

    if (!cleanWa.startsWith('08') && !cleanWa.startsWith('628')) {
      setErrorMsg('Nomor WhatsApp harus diawali dengan 08 atau 628');
      return;
    }

    if (cleanWa.length < 10 || cleanWa.length > 15) {
      setErrorMsg('Nomor WhatsApp tidak valid (minimal 10-15 digit)');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          price: displayPrice,
          basePrice,
          margin,
          customerWa: cleanWa,
          customerEmail: email.trim(),
          paymentChannel,
          productImage
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses pesanan. Silakan coba lagi.');
      }

      router.push(`/invoice/${data.invoice}`);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Terjadi kesalahan sistem.');
      }
      setIsLoading(false);
    }
  };

  if (!productId) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-gray-200/50 max-w-lg mx-auto">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
          🛍️
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 mb-6">
          Silakan pilih produk yang ingin Anda beli terlebih dahulu melalui katalog utama kami.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Kolom Kiri: Formulir Detail Kontak & Pembayaran */}
      <div className="lg:col-span-7 bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl shadow-xl shadow-gray-200/50">
        
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-1">Informasi Pemesan</h2>
            <p className="text-xs text-gray-500 font-medium">Lengkapi kontak untuk penerimaan akun & instruksi pembayaran.</p>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Langkah 1 dari 2
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-5">
          
          {/* Input WhatsApp */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">
              Nomor WhatsApp <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input 
                type="text" 
                required
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all shadow-inner font-mono"
              />
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hanya digunakan jika pesanan terjadi kendala.
            </p>
          </div>

          {/* Input Email (Opsional) */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">
              Alamat Email <span className="text-gray-400 font-normal">(Opsional)</span>
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all shadow-inner"
            />
            <p className="text-[11px] text-gray-500 font-medium mt-1.5">
              Untuk cadangan bukti transaksi & informasi klaim garansi.
            </p>
          </div>

          {/* Pilihan Metode Pembayaran */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-3">
              Metode Pembayaran
            </label>

            <div className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 text-gray-900 flex items-center justify-between cursor-default transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs shadow-xs shrink-0">
                  QRIS
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900">QRIS All Payment</div>
                  <div className="text-[11px] font-medium text-gray-500">BCA, Mandiri, GoPay, OVO, Dana, ShopeePay (Realtime 24/7).</div>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tombol Submit */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold text-sm sm:text-base py-4 rounded-2xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses QRIS Pembayaran...</span>
              </>
            ) : (
              <>
                <span>Lanjutkan Pembayaran QRIS</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

      </div>

      {/* Kolom Kanan: Ringkasan Pesanan (Sticky) */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
        
        <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl shadow-xl shadow-gray-200/50">
          <h2 className="text-base sm:text-lg font-black text-gray-900 mb-5 pb-4 border-b border-gray-100 flex items-center justify-between">
            <span>Ringkasan Pesanan</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              Stok Ready
            </span>
          </h2>

          {/* Item Produk */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl font-black text-indigo-700 shadow-xs overflow-hidden shrink-0 relative">
              {productImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={productImage} 
                  alt={productName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                productName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">{productName}</h3>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-1">
                <span>⚡ Pengiriman Instan 24/7</span>
              </div>
            </div>
          </div>

          {/* Rincian Harga */}
          <div className="space-y-3 text-xs sm:text-sm font-medium mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Harga Produk</span>
              <span className="font-bold text-gray-900">Rp {displayPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Biaya Layanan & Admin</span>
              <span className="text-emerald-600 font-extrabold">Gratis</span>
            </div>
          </div>

          {/* Total Tagihan */}
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Total Tagihan</span>
              <span className="text-2xl sm:text-3xl font-black text-gray-900">
                Rp {displayPrice.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Trust Badges Ringkas */}
        <div className="bg-slate-50/80 border border-gray-100 p-4 rounded-2xl space-y-2 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Garansi penuh sesuai masa aktif langganan.</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Transaksi aman terenkripsi via QRIS resmi.</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-24">
      
      {/* Background Soft Glow Aksen Indigo-Purple */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Header Halaman */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-2">
            Checkout <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">Pesanan</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-medium">
            Selesaikan pengisian data di bawah ini untuk mendapatkan kode QRIS pembayaran instan.
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-xl shadow-gray-200/50">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3"></div>
            <p className="text-indigo-600 font-extrabold text-sm">Loading checkout data...</p>
          </div>
        }>
          <CheckoutForm />
        </Suspense>

      </main>
    </div>
  );
} 