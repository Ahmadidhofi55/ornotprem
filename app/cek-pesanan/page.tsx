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

function CekPesananContent() {
  const searchParams = useSearchParams();
  const queryInvoice = searchParams.get('invoice') || '';

  const [inputInvoice, setInputInvoice] = useState(queryInvoice);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = useCallback(async (targetInvoice: string): Promise<void> => {
    const cleanInvoice = targetInvoice.trim();
    if (!cleanInvoice) return;

    setIsLoading(true);
    setErrorMsg('');
    setTransaction(null);

    try {
      // 1. Panggil API server-side untuk memaksa update status menjadi PAID
      await fetch('/api/check-payment-alt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceNumber: cleanInvoice })
      });

      // 2. Ambil data terbaru dari Supabase
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
      if (!inv.trim()) return;
      if (!isMounted) return;
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

  const isPaid = (transaction?.payment_status || '').toUpperCase() === 'PAID';

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Form Pencarian */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Masukkan Nomor Invoice
            </label>
            <div className="flex gap-3">
              <input 
                type="text" 
                required
                value={inputInvoice}
                onChange={(e) => setInputInvoice(e.target.value)}
                placeholder="Contoh: INV-..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold px-8 py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Mencari...' : 'Cari'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-rose-500/20 border border-rose-500/50 p-6 rounded-2xl text-rose-300 text-center mb-8">
          {errorMsg}
        </div>
      )}

      {/* Hasil Pencarian */}
      {transaction && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">No. Invoice</p>
              <h3 className="text-xl font-bold font-mono text-white">{transaction.invoice_number}</h3>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                isPaid 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isPaid ? 'Lunas / Paid' : 'Belum Lunas'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-xs text-gray-400 mb-1">Produk Dibeli</p>
              <p className="font-bold text-white text-base">{transaction.product_name}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-xs text-gray-400 mb-1">Total Dibayar</p>
              <p className="font-bold text-cyan-400 text-base">Rp {transaction.total_price.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">WhatsApp Tujuan Penerima</p>
            <p className="text-white font-medium bg-black/30 px-4 py-3 rounded-xl border border-white/5 font-mono">
              {transaction.customer_wa}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">Detail Akun / Status Pengiriman</p>
            <div className="bg-black/50 border border-cyan-500/30 p-5 rounded-xl font-mono text-sm text-cyan-300 whitespace-pre-wrap leading-relaxed">
              {transaction.digital_account_details || 'Akun sedang disiapkan dan dikirimkan otomatis ke WhatsApp Anda.'}
            </div>
          </div>

          {!isPaid && (
            <div className="pt-2">
              <Link 
                href={`/invoice/${transaction.invoice_number}`}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold py-3.5 rounded-xl transition-all block text-center shadow-lg shadow-cyan-500/20"
              >
                Bayar Sekarang (Buka QRIS) &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default function CekPesananPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-cyan-500/30 pb-24 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Cek Status Pesanan</h1>
          <p className="text-gray-400">Lacak riwayat transaksi dan dapatkan detail akun premium Anda di sini.</p>
        </div>

        <Suspense fallback={<div className="text-center py-20 text-cyan-400 font-bold animate-pulse">Memuat halaman...</div>}>
          <CekPesananContent />
        </Suspense>
      </main>
    </div>
  );
}