// app/checkout/page.tsx
"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = searchParams.get('id');
  const productName = searchParams.get('name') || 'Produk Digital';
  const displayPrice = searchParams.get('price') ? Number(searchParams.get('price')) : 0;
  
  // Menangkap parameter gambar dari API products (image, icon, thumbnail, img)
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

    if (!waNumber.startsWith('08') && !waNumber.startsWith('628')) {
      setErrorMsg('Nomor WhatsApp harus diawali 08 atau 628');
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
          customerWa: waNumber,
          customerEmail: email,
          paymentChannel,
          productImage
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses pesanan');
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
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Produk tidak ditemukan</h2>
        <Link href="/" className="text-cyan-400 hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Detail Kontak</h2>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Nomor WhatsApp <span className="text-rose-400">*</span>
            </label>
            <input 
              type="number" 
              required
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              placeholder="081234567890"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">Detail akun premium akan dikirimkan otomatis ke nomor ini.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Alamat Email <span className="text-gray-500 font-normal">(Opsional)</span>
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="pt-4 border-t border-white/10">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Metode Pembayaran
            </label>
            <div className="p-4 rounded-xl border bg-cyan-500/10 border-cyan-500/50 text-white flex items-center justify-between cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-black text-blue-900 shadow-inner">
                  QR
                </div>
                <div>
                  <div className="font-bold text-cyan-400">QRIS All Payment</div>
                  <div className="text-xs mt-1 text-gray-400">Bebas biaya admin. Dicek otomatis (Realtime).</div>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses QRIS & Pesanan...' : 'Lanjutkan Pembayaran'}
          </button>
        </form>
      </div>

      <div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] sticky top-24">
          <h2 className="text-xl font-bold text-white mb-6">Ringkasan Pesanan</h2>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            {/* Bagian Ikon / Gambar Produk */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-lg overflow-hidden flex-shrink-0 relative">
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
            
            <div>
              <h3 className="text-lg font-bold text-white">{productName}</h3>
              <p className="text-sm text-cyan-400">Pengiriman Instan Otomatis</p>
            </div>
          </div>

          <div className="space-y-4 text-sm font-medium mb-6">
            <div className="flex justify-between text-gray-300">
              <span>Harga Dasar + Margin</span>
              <span>Rp {displayPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Biaya Layanan</span>
              <span className="text-emerald-400">Gratis</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Kode Unik API</span>
              <span className="text-yellow-400 italic">Dihitung saat klik Lanjutkan</span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="text-gray-400 font-semibold">Estimasi Tagihan</span>
            <span className="text-3xl font-black text-white">
              ~Rp {displayPrice.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 pb-24">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Checkout Pesanan</h1>
          <p className="text-gray-400">Selesaikan form di bawah ini untuk mendapatkan QRIS Pembayaran.</p>
        </div>

        <Suspense fallback={<div className="text-center py-20 text-cyan-400 font-bold animate-pulse">Memuat data checkout...</div>}>
          <CheckoutForm />
        </Suspense>

      </main>
    </div>
  );
}