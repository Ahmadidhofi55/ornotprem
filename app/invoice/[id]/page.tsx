// app/invoice/[id]/page.tsx
"use client";

import { useEffect, useState, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Transaction {
  invoice_number: string;
  product_name: string;
  customer_wa: string;
  total_price: number;
  payment_status: string;
  api_response_log: string;
  digital_account_details?: string;
}

interface ApiResponseLog {
  qr_image?: string;
  kode_unik?: number;
  product_icon?: string;
  premku_deposit_invoice?: string;
}

export default function InvoiceInteractivePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params);
  const invoiceId = decodeURIComponent(resolvedParams.id);
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [apiLog, setApiLog] = useState<ApiResponseLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Ambil data transaksi awal
  useEffect(() => {
    const fetchTx = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('invoice_number', invoiceId)
        .single();

      if (!error && data) {
        setTransaction(data);
        if (data.api_response_log) {
          try {
            setApiLog(JSON.parse(data.api_response_log));
          } catch (e) {
            console.error(e);
          }
        }
      }
      setIsLoading(false);
    };

    fetchTx();
  }, [invoiceId]);

  // AUTO-SYNC POLLING: Cek status pembayaran ke API setiap 5 detik jika belum PAID
  useEffect(() => {
    if (!transaction || transaction.payment_status === 'PAID') return;

    const interval = setInterval(async () => {
      try {
        setCheckingPayment(true);
        const res = await fetch('/api/check-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceNumber: invoiceId })
        });
        const result = await res.json();

        if (result.success && result.status === 'PAID') {
          // Jika sudah bayar, reload atau update state lokal ke PAID
          setTransaction(prev => prev ? { ...prev, payment_status: 'PAID' } : null);
        }
      } catch (e) {
        console.error("Gagal sinkronisasi pembayaran", e);
      } finally {
        setCheckingPayment(false);
      }
    }, 5000); // Cek setiap 5 detik

    return () => clearInterval(interval);
  }, [transaction, invoiceId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-cyan-400 flex items-center justify-center font-bold animate-pulse">
        Memuat Tagihan Pembayaran...
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-3xl max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold text-red-400 mb-4">404 - Not Found</h2>
          <p className="text-gray-300 mb-6">Invoice <strong>{invoiceId}</strong> tidak ditemukan.</p>
          <Link href="/" className="bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-cyan-400 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = transaction.payment_status === 'PAID';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-cyan-500/30 pb-24 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md">
            <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            <span className={`text-xs font-bold tracking-wide uppercase ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
              Status: {isPaid ? 'Pembayaran Berhasil (Lunas)' : checkingPayment ? 'Mengecek mutasi QRIS...' : 'Menunggu Pembayaran'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Invoice {transaction.invoice_number}
          </h1>
          <p className="text-gray-400">Sistem memantau pembayaran Anda secara otomatis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Kolom Kiri: Detail Pesanan */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Detail Pesanan</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Produk</p>
                  <p className="text-lg font-bold text-white">{transaction.product_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Nomor WhatsApp Tujuan</p>
                  <p className="text-white font-medium">{transaction.customer_wa}</p>
                </div>
                {apiLog?.kode_unik && !isPaid && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Kode Unik Transfer</p>
                    <p className="text-yellow-400 font-bold">+{apiLog.kode_unik}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-white/10 mt-4">
                  <p className="text-sm text-gray-400 font-medium mb-1">Total Tagihan (Pas)</p>
                  <p className="text-3xl font-black text-cyan-400">
                    Rp {transaction.total_price.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {isPaid && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <button 
                  onClick={() => router.push(`/cek-pesanan?invoice=${transaction.invoice_number}`)}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 text-center block"
                >
                  Cek Status Pesanan & Akun &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Kolom Kanan: QRIS / Status Lunas */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-xl flex flex-col items-center justify-center text-center">
            {isPaid ? (
              <div className="text-emerald-400 flex flex-col items-center py-6">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Pembayaran Berhasil!</h3>
                <p className="text-gray-300 text-sm mb-4">
                  {transaction.digital_account_details || 'Akun premium telah dikirimkan otomatis ke WhatsApp Anda.'}
                </p>
                <Link 
                  href={`/cek-pesanan?invoice=${transaction.invoice_number}`}
                  className="text-cyan-400 font-bold hover:underline text-sm"
                >
                  Lihat Detail Riwayat Pesanan &rarr;
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-2">Scan QRIS</h2>
                <p className="text-gray-400 text-sm mb-6">Scan menggunakan aplikasi bank atau e-wallet apa saja. Halaman akan berubah otomatis saat lunas.</p>
                
                {apiLog?.qr_image ? (
                  <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={apiLog.qr_image} 
                      alt="QRIS Pembayaran" 
                      className="w-48 h-48 md:w-56 md:h-56 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-white/10 rounded-3xl mb-6 flex items-center justify-center text-gray-500 border border-white/10">
                    QRIS tidak tersedia
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 px-4 py-2.5 rounded-xl border border-cyan-500/20 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Menunggu scan & pembayaran Anda...
                </div>
              </>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}