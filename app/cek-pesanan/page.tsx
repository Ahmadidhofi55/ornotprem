// app/cek-pesanan/page.tsx
"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

interface Transaction {
  invoice_number: string;
  product_name: string;
  customer_wa: string;
  total_price: number;
  payment_status?: string;
  delivery_status: string;
  digital_account_details: string;
  created_at: string;
}

// Helper aman untuk mengecek apakah transaksi sudah expired (> 120 menit)
const isTransactionExpired = (createdAtStr: string, paymentStatus?: string): boolean => {
  const statusUpper = (paymentStatus || '').toUpperCase();
  if (['EXPIRED', 'CANCELLED', 'BATAL'].includes(statusUpper)) {
    return true;
  }
  if (['PAID', 'SUCCESS', 'COMPLETED', 'LUNAS'].includes(statusUpper)) {
    return false;
  }
  if (!createdAtStr) return false;

  try {
    const isoFormatted = createdAtStr.replace(' ', 'T');
    const createdAtMs = new Date(isoFormatted).getTime();
    if (isNaN(createdAtMs)) return false;

    const expireTimeMs = createdAtMs + 120 * 60 * 1000; // 120 menit dalam milidetik
    return Date.now() > expireTimeMs;
  } catch {
    return false;
  }
};

function CekPesananContent() {
  const searchParams = useSearchParams();
  const queryInvoice = searchParams.get('invoice') || '';

  const [inputInvoice, setInputInvoice] = useState(queryInvoice);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSearch = useCallback(async (targetInvoice: string): Promise<void> => {
    const cleanInvoice = targetInvoice.trim();
    if (!cleanInvoice) return;

    setIsLoading(true);
    setErrorMsg('');
    setTransaction(null);

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .ilike('invoice_number', cleanInvoice)
        .single();

      if (error || !data) {
        throw new Error('Pesanan dengan nomor invoice tersebut tidak ditemukan.');
      }

      setTransaction(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Terjadi kesalahan saat mencari data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialFetch(inv: string) {
      if (!inv.trim() || !isMounted) return;
      await handleSearch(inv);
    }

    if (queryInvoice) {
      initialFetch(queryInvoice);
    }

    return () => {
      isMounted = false;
    };
  }, [queryInvoice, handleSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(inputInvoice);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusUpper = (transaction?.payment_status || '').toUpperCase();
  const isPaid = statusUpper === 'PAID' || statusUpper === 'SUCCESS' || statusUpper === 'LUNAS';
  const isExpired = transaction ? isTransactionExpired(transaction.created_at, transaction.payment_status) : false;

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Form Pencarian */}
      <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl shadow-xl shadow-gray-200/50 mb-8">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs sm:text-sm font-extrabold text-gray-900 ml-1">
            Masukkan Nomor Invoice
          </label>
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                required
                value={inputInvoice}
                onChange={(e) => setInputInvoice(e.target.value)}
                placeholder="Contoh: INV-GUEST-..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all font-mono text-sm font-medium shadow-inner"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold px-6 sm:px-8 py-3.5 rounded-2xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer text-sm shrink-0 flex items-center gap-2"
            >
              {isLoading ? (
                <span>Mencari...</span>
              ) : (
                <>
                  <span>Cari</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl text-rose-700 text-center text-sm font-semibold mb-8 shadow-sm flex items-center justify-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hasil Pencarian */}
      {transaction && (
        <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl shadow-xl shadow-gray-200/50 space-y-6">
          
          {/* Header Invoice & Status Badge */}
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-5">
            <div>
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-0.5">Nomor Invoice</p>
              <h3 className="text-xl font-black font-mono text-gray-900">{transaction.invoice_number}</h3>
            </div>
            <div>
              {isPaid ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Lunas / Paid
                </span>
              ) : isExpired ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-rose-50 text-rose-700 border border-rose-200/80">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Expired / Kadaluarsa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-amber-50 text-amber-700 border border-amber-200/80 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Menunggu Pembayaran
                </span>
              )}
            </div>
          </div>

          {/* Grid Informasi Produk & Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-gray-100">
              <p className="text-[11px] text-gray-400 font-bold mb-1">Produk Dibeli</p>
              <p className="font-extrabold text-gray-900 text-base">{transaction.product_name}</p>
            </div>
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/80">
              <p className="text-[11px] text-gray-500 font-bold mb-1">Total Pembayaran</p>
              <p className="font-black text-indigo-700 text-lg">Rp {Number(transaction.total_price).toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Nomor WhatsApp Tujuan */}
          <div>
            <p className="text-[11px] text-gray-400 font-bold mb-1.5">Nomor WhatsApp Tujuan Penerima</p>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 font-mono text-sm font-semibold text-gray-800">
              {transaction.customer_wa}
            </div>
          </div>

          {/* Detail Akun Digital / Banner Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-gray-400 font-bold">Detail Akun & Akses Premium</p>
              {isPaid && transaction.digital_account_details && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(transaction.digital_account_details)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                >
                  {copied ? '✓ Tersalin' : '📋 Salin Akun'}
                </button>
              )}
            </div>

            {isPaid ? (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl font-mono text-sm text-emerald-400 whitespace-pre-wrap leading-relaxed shadow-inner">
                {transaction.digital_account_details || 'Akun sedang disiapkan dan dikirimkan otomatis ke WhatsApp Anda.'}
              </div>
            ) : isExpired ? (
              <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl text-rose-800 text-sm font-medium leading-relaxed">
                <p className="font-extrabold text-rose-900 mb-1">QRIS / Pembayaran Telah Kadaluarsa</p>
                Batas waktu pembayaran 120 menit untuk transaksi ini telah habis. Silakan buat pesanan baru untuk mendapatkan QRIS baru.
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200/80 p-5 rounded-2xl text-amber-900 text-sm font-medium leading-relaxed">
                <p className="font-extrabold text-amber-950 mb-1">Belum Melakukan Pembayaran</p>
                Selesaikan pembayaran via QRIS sebelum batas waktu habis untuk membuka detail akun premium Anda.
              </div>
            )}
          </div>

          {/* Tombol Aksi Sesuai Status */}
          <div className="pt-2">
            {!isPaid && !isExpired && (
              <Link 
                href={`/invoice/${transaction.invoice_number}`}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold py-3.5 rounded-2xl transition-all block text-center shadow-md shadow-indigo-600/20 text-sm"
              >
                Bayar Sekarang (Buka QRIS) &rarr;
              </Link>
            )}

            {isExpired && (
              <Link 
                href="/"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-extrabold py-3.5 rounded-2xl transition-all block text-center shadow-md text-sm"
              >
                Pesan Ulang Produk Ini &rarr;
              </Link>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

export default function CekPesananPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans selection:bg-indigo-500/20 pb-24 relative overflow-hidden">
      
      {/* Background Soft Glow Aksen Indigo-Purple */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-3 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Layanan Pelanggan
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-2">
            Cek Status <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">Pesanan</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-medium">
            Lacak riwayat transaksi, cek status pembayaran, dan dapatkan detail akun premium Anda secara instan.
          </p>
        </div>

        <Suspense fallback={
          <div className="text-center py-20 text-indigo-600 font-extrabold animate-pulse text-sm">
           Loading search page...
          </div>
        }>
          <CekPesananContent />
        </Suspense>
      </main>
    </div>
  );
}