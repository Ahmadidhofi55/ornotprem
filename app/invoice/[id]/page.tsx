// app/invoice/[id]/page.tsx
"use client";

import { useEffect, useState, use, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Transaction {
  invoice_number: string;
  product_name: string;
  customer_wa: string;
  total_price: number;
  payment_status: string;
  api_response_log: string | null;
  digital_account_details?: string | null;
  created_at?: string | null;
}

interface PremkuPayData {
  invoice?: string;
  amount_req?: number;
  kode_unik?: number;
  total_bayar?: number;
  qr_image?: string;
  qr_raw?: string;
  expired_in?: string;
}

interface ApiResponseLog {
  success?: boolean;
  message?: string;
  data?: PremkuPayData;
  qr_image?: string;
  qr_raw?: string;
  kode_unik?: number;
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
  
  // State Countdown Timer (detik)
  const [timeLeft, setTimeLeft] = useState<number>(120 * 60);

  // State Modal Perbesar QRIS
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasFiredPixel = useRef(false);

  // 1. Fetch data dari Supabase
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
            console.error("Gagal parse api_response_log:", e);
          }
        }

        if (data.created_at) {
          const createdAtTime = new Date(data.created_at).getTime();
          const expireTime = createdAtTime + 120 * 60 * 1000; // 120 menit
          const remainingSeconds = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
          setTimeLeft(remainingSeconds);
        }
      }
      setIsLoading(false);
    };

    fetchTx();
  }, [invoiceId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!transaction || transaction.payment_status === 'PAID') return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [transaction]);

  // 3. Automated Polling Cek Status Pembayaran
  useEffect(() => {
    if (!transaction || transaction.payment_status === 'PAID' || timeLeft === 0) return;

    const interval = setInterval(async () => {
      try {
        setCheckingPayment(true);
        const res = await fetch('/api/check-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceNumber: invoiceId })
        });
        const result = await res.json();

        if (result.success && (result.status === 'PAID' || result.transaction?.payment_status === 'PAID')) {
          setTransaction(prev => {
            if (!prev) return null;
            return {
              ...prev,
              payment_status: 'PAID',
              digital_account_details: result.transaction?.digital_account_details || prev.digital_account_details
            };
          });
        }
      } catch (e) {
        console.error("Gagal cek status pembayaran:", e);
      } finally {
        setCheckingPayment(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transaction, invoiceId, timeLeft]);

  // 4. Meta Pixel "Purchase" Event
  useEffect(() => {
    if (transaction?.payment_status === 'PAID' && !hasFiredPixel.current) {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', {
          value: Number(transaction.total_price),
          currency: 'IDR',
          content_name: transaction.product_name,
          content_category: 'Direct Purchase',
          order_id: invoiceId
        });
        console.log("🔥 Meta Pixel 'Purchase' Event Fired!");
      }
      hasFiredPixel.current = true;
    }
  }, [transaction, invoiceId]);

  // Format detik ke HH:MM:SS
  const formatTimeLeft = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Helper gambar QRIS
  const getQrImageUrl = (): string | null => {
    if (!apiLog) return null;
    const img = apiLog.data?.qr_image || apiLog.qr_image;
    if (img) return img;

    const raw = apiLog.data?.qr_raw || apiLog.qr_raw;
    if (raw) {
      if (raw.startsWith('data:image')) return raw;
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(raw)}`;
    }
    return null;
  };

  // Helper Kode Unik
  const getKodeUnik = (): number | null => {
    if (!apiLog) return null;
    return apiLog.data?.kode_unik ?? apiLog.kode_unik ?? null;
  };

  // Fungsi Unduh Gambar QRIS
  const handleDownloadQr = async () => {
    const url = getQrImageUrl();
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QRIS-${transaction?.invoice_number || 'payment'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback untuk Base64 / Direct link
      const link = document.createElement('a');
      link.href = url;
      link.download = `QRIS-${transaction?.invoice_number || 'payment'}.png`;
      link.target = '_blank';
      link.click();
    }
  };

  const qrImageUrl = getQrImageUrl();
  const kodeUnik = getKodeUnik();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center font-bold text-indigo-600">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3"></div>
        <p className="text-xs sm:text-sm font-extrabold">Memuat Invoice Pembayaran...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white border border-gray-100 p-8 rounded-3xl max-w-sm shadow-xl shadow-gray-200/50">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3">
            ⚠️
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-2">Invoice Tidak Ditemukan</h2>
          <p className="text-xs text-gray-500 mb-6">Nomor invoice <strong>{invoiceId}</strong> tidak terdaftar di sistem.</p>
          <Link href="/" className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 inline-block">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = transaction.payment_status === 'PAID';
  const isExpired = timeLeft === 0 && !isPaid;

  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans selection:bg-indigo-500/20 pb-24 relative overflow-hidden">
      
      {/* Background Soft Glow Aksen Indigo-Purple */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        
        {/* Header Invoice */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] sm:text-xs font-bold uppercase tracking-wide mb-2 ${
            isPaid 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : isExpired 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isPaid ? 'bg-emerald-600' : isExpired ? 'bg-rose-600' : 'bg-amber-600 animate-pulse'
            }`}></span>
            <span>
              {isPaid ? 'Pembayaran Berhasil' : isExpired ? 'QRIS Kadaluwarsa' : checkingPayment ? 'Mengecek Pembayaran...' : 'Menunggu Pembayaran'}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-gray-900 mb-1">
            Invoice #{transaction.invoice_number}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Sistem mengecek status pembayaran otomatis secara real-time.
          </p>
        </div>

        {/* GRID 2 KOLOM (Mobile & PC Selalu 2 Kolom) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 items-start">

          {/* KOLOM 1: RINCIAN PESANAN */}
          <div className="bg-white border border-gray-100 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/50 flex flex-col justify-between">
            <div>
              <h2 className="text-xs sm:text-base font-extrabold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Rincian Pesanan
              </h2>

              <div className="space-y-2.5 sm:space-y-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider">Produk</p>
                  <p className="text-xs sm:text-base font-extrabold text-gray-900 truncate">{transaction.product_name}</p>
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider">No. WhatsApp</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate font-mono">{transaction.customer_wa}</p>
                </div>

                {kodeUnik !== null && !isPaid && (
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider">Kode Unik</p>
                    <p className="text-xs sm:text-sm font-extrabold text-amber-600">+{kodeUnik}</p>
                  </div>
                )}

                <div className="pt-2 sm:pt-3 border-t border-gray-100">
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider">Total Tagihan</p>
                  <p className="text-sm sm:text-2xl font-black text-indigo-700">
                    Rp {Number(transaction.total_price).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {isPaid && (
              <div className="mt-4 sm:mt-6 pt-3 border-t border-gray-100">
                <button
                  onClick={() => router.push(`/cek-pesanan?invoice=${transaction.invoice_number}`)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold py-2.5 sm:py-3.5 rounded-xl text-[11px] sm:text-xs transition-all shadow-md shadow-indigo-600/20 text-center block"
                >
                  Cek Akun & Detail &rarr;
                </button>
              </div>
            )}
          </div>

          {/* KOLOM 2: QRIS / STATUS BAYAR */}
          <div className="bg-white border border-gray-100 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center text-center">
            {isPaid ? (
              <div className="flex flex-col items-center py-2 sm:py-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-3 text-emerald-600">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-lg font-extrabold text-gray-900 mb-1">Lunas!</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-3">
                  Detail akun telah dikirimkan otomatis ke WhatsApp Anda.
                </p>
                <Link
                  href={`/cek-pesanan?invoice=${transaction.invoice_number}`}
                  className="text-indigo-600 font-bold hover:underline text-[11px] sm:text-xs"
                >
                  Lihat Detail Akses &rarr;
                </Link>
              </div>
            ) : isExpired ? (
              <div className="flex flex-col items-center py-2 sm:py-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mb-3 text-rose-600">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-lg font-extrabold text-gray-900 mb-1">QRIS Kadaluwarsa</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-4">
                  Batas waktu pembayaran 120 menit telah habis.
                </p>
                <Link
                  href="/"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-xl text-[11px] sm:text-xs transition-all shadow-sm"
                >
                  Pesan Ulang
                </Link>
              </div>
            ) : (
              <>
                {/* WAKTU TENGAT */}
                <div className="mb-3 bg-amber-50 border border-amber-200 px-2.5 sm:px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-xs text-amber-700 font-bold">Batas:</span>
                  <span className="font-mono text-xs sm:text-sm font-black text-amber-800 tracking-wider">
                    {formatTimeLeft(timeLeft)}
                  </span>
                </div>

                {/* QRIS IMAGE */}
                {qrImageUrl ? (
                  <div className="bg-white p-2 border border-gray-100 rounded-2xl shadow-inner mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrImageUrl}
                      alt="QRIS Payment"
                      className="w-28 h-28 sm:w-48 sm:h-48 object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 sm:w-48 sm:h-48 bg-gray-50 rounded-2xl mb-3 flex items-center justify-center text-gray-400 border border-gray-200 text-[10px] p-2 text-center">
                    QRIS Tidak Tersedia
                  </div>
                )}

                {/* TOMBOL AKSI QRIS (PERBESAR & UNDUH) */}
                {qrImageUrl && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 w-full mb-3">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full sm:w-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs transition-all border border-indigo-100 flex items-center justify-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                      <span>Perbesar</span>
                    </button>

                    <button
                      onClick={handleDownloadQr}
                      className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-gray-800 font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs transition-all border border-gray-200 flex items-center justify-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Unduh</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-600 font-medium animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  <span>Menunggu pembayaran...</span>
                </div>
              </>
            )}
          </div>

        </div>

      </main>

      {/* MODAL PERBESAR QRIS */}
      {isModalOpen && qrImageUrl && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs sm:max-w-sm w-full shadow-2xl relative text-center border border-gray-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-base bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center"
            >
              ✕
            </button>
            <h3 className="text-base font-extrabold text-gray-900 mb-1">QRIS Pembayaran</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">Scan dengan aplikasi M-Banking atau E-Wallet.</p>
            
            <div className="bg-white p-3 border border-gray-100 rounded-2xl shadow-inner mb-5 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImageUrl} alt="QRIS Large" className="w-56 h-56 sm:w-64 sm:h-64 mx-auto object-contain" />
            </div>

            <button
              onClick={handleDownloadQr}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Unduh Gambar QRIS</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}