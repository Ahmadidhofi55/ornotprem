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
  
  // State untuk Countdown Timer (dalam hitungan detik)
  const [timeLeft, setTimeLeft] = useState<number>(120 * 60); // Default 120 menit (7200 detik)

  const hasFiredPixel = useRef(false);

  // 1. Fetch initial transaction data from Supabase
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
            console.error("Failed to parse api_response_log:", e);
          }
        }

        // Hitung sisa waktu berdasarkan created_at transaksi (+120 menit)
        if (data.created_at) {
          const createdAtTime = new Date(data.created_at).getTime();
          const expireTime = createdAtTime + 120 * 60 * 1000; // 120 menit dalam ms
          const remainingSeconds = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
          setTimeLeft(remainingSeconds);
        }
      }
      setIsLoading(false);
    };

    fetchTx();
  }, [invoiceId]);

  // 2. Countdown Timer Effect (Berjalan tiap detik sampai 0 atau PAID)
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

  // 3. Automated polling to check payment status
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
        console.error("Failed to sync payment status", e);
      } finally {
        setCheckingPayment(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transaction, invoiceId, timeLeft]);

  // 4. Meta Pixel "Purchase" Event Effect
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

  // Format detik menjadi format Jam:Menit:Detik (HH:MM:SS)
  const formatTimeLeft = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Helper to extract QRIS Image URL from different Premku JSON structures
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

  // Helper to extract Unique Code
  const getKodeUnik = (): number | null => {
    if (!apiLog) return null;
    return apiLog.data?.kode_unik ?? apiLog.kode_unik ?? null;
  };

  const qrImageUrl = getQrImageUrl();
  const kodeUnik = getKodeUnik();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-cyan-400 flex items-center justify-center font-bold animate-pulse">
        Loading Payment Invoice...
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-3xl max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold text-red-400 mb-4">404 - Not Found</h2>
          <p className="text-gray-300 mb-6">Invoice <strong>{invoiceId}</strong> was not found.</p>
          <Link href="/" className="bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-cyan-400 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = transaction.payment_status === 'PAID';
  const isExpired = timeLeft === 0 && !isPaid;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-cyan-500/30 pb-24 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none"></div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md">
            <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : isExpired ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`}></span>
            <span className={`text-xs font-bold tracking-wide uppercase ${isPaid ? 'text-emerald-400' : isExpired ? 'text-red-400' : 'text-amber-400'}`}>
              Status: {isPaid ? 'Payment Successful (Paid)' : isExpired ? 'Payment Expired' : checkingPayment ? 'Checking QRIS payment...' : 'Awaiting Payment'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Invoice {transaction.invoice_number}
          </h1>
          <p className="text-gray-400">The system automatically monitors your payment status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LEFT COLUMN: ORDER DETAILS */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Order Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Product</p>
                  <p className="text-lg font-bold text-white">{transaction.product_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Target WhatsApp Number</p>
                  <p className="text-white font-medium">{transaction.customer_wa}</p>
                </div>
                {kodeUnik !== null && !isPaid && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Unique Transfer Code</p>
                    <p className="text-yellow-400 font-bold">+{kodeUnik}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-white/10 mt-4">
                  <p className="text-sm text-gray-400 font-medium mb-1">Total Amount Due</p>
                  <p className="text-3xl font-black text-cyan-400">
                    Rp {Number(transaction.total_price).toLocaleString('id-ID')}
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
                  Check Order Status & Account &rarr;
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: QRIS / PAID / EXPIRED STATUS */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-xl flex flex-col items-center justify-center text-center">
            {isPaid ? (
              <div className="text-emerald-400 flex flex-col items-center py-6">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Payment Successful!</h3>
                <div className="bg-black/50 border border-emerald-500/30 p-4 rounded-xl font-mono text-sm text-emerald-300 text-left w-full my-4 whitespace-pre-wrap">
                  {transaction.digital_account_details || 'Your premium account details have been automatically sent to your WhatsApp.'}
                </div>
                <Link
                  href={`/cek-pesanan?invoice=${transaction.invoice_number}`}
                  className="text-cyan-400 font-bold hover:underline text-sm"
                >
                  View Order History Details &rarr;
                </Link>
              </div>
            ) : isExpired ? (
              /* EXPIRED STATE */
              <div className="text-red-400 flex flex-col items-center py-6">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">QRIS Expired</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">
                  Batas waktu pembayaran 120 menit telah habis. Silakan lakukan pemesanan ulang.
                </p>
                <Link
                  href="/"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all border border-white/20 text-sm"
                >
                  Order Again
                </Link>
              </div>
            ) : (
              /* AWAITING PAYMENT STATE */
              <>
                <h2 className="text-xl font-bold text-white mb-2">Scan QRIS</h2>
                <p className="text-gray-400 text-sm mb-4">Scan using any mobile banking or e-wallet app. This page will update automatically upon completion.</p>

                {/* COUNTDOWN TIMER BADGE */}
                <div className="mb-6 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <span className="text-xs text-amber-400 font-medium">payment deadline:</span>
                  <span className="font-mono text-base font-extrabold text-amber-300 tracking-wider">
                    {formatTimeLeft(timeLeft)}
                  </span>
                </div>

                {qrImageUrl ? (
                  <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrImageUrl}
                      alt="QRIS Payment"
                      className="w-48 h-48 md:w-56 md:h-56 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-white/10 rounded-3xl mb-6 flex items-center justify-center text-gray-500 border border-white/10 text-xs px-4 text-center">
                    QRIS unavailable or failed to load
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 px-4 py-2.5 rounded-xl border border-cyan-500/20 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Awaiting your scan & payment...
                </div>
              </>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}