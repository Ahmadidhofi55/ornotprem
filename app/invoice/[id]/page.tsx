// app/invoice/[id]/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  extractPremkuDepositId, 
  checkDepositStatus, 
  createProductOrder, 
  checkOrderStatus 
} from '../../lib/premku';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getCurrentTimestamp(): Promise<number> {
  return Date.now();
}

function parseTimestamp(dateStr?: string): number {
  if (!dateStr) return Date.now();
  let formatted = dateStr.trim();
  if (!formatted.includes('T') && formatted.includes(' ')) {
    formatted = formatted.replace(' ', 'T');
  }
  if (!formatted.endsWith('Z') && !formatted.includes('+') && !formatted.includes('-')) {
    formatted += 'Z';
  }
  const timestamp = new Date(formatted).getTime();
  return isNaN(timestamp) ? new Date(dateStr).getTime() : timestamp;
}

interface Transaction {
  id: string;
  user_id?: string;
  invoice_number: string;
  api_product_id?: string;
  product_name: string;
  customer_wa?: string;
  customer_email?: string;
  base_price?: number;
  margin?: number;
  total_price: number;
  payment_channel?: string;
  payment_status: string;
  delivery_status?: string;
  digital_account_details?: string;
  api_response_log?: string;
  created_at: string;
  updated_at?: string;
  base_cost_price?: number;
  cost_price?: number;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id || id === 'undefined' || id === 'null') {
    return { title: 'Invoice Tidak Valid | Ornot Prem' };
  }

  return {
    title: `Invoice #${id} | Ornot Prem`,
    description: `Detail transaksi dan status pembayaran invoice ${id} di Ornot Prem.`,
  };
}

export default async function InvoicePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;

  if (!rawId || rawId === 'undefined' || rawId === 'null' || rawId.trim() === '') {
    notFound();
  }

  const invoiceId = decodeURIComponent(rawId).trim();

  let fetchError = '';
  let fetchedTx: Transaction | null = null;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('invoice_number', invoiceId)
      .maybeSingle();

    if (error) {
      fetchError = error.message;
    } else if (data) {
      fetchedTx = data as unknown as Transaction;
    }
  } catch (err: unknown) {
    fetchError = err instanceof Error ? err.message : 'Gagal mengambil data invoice';
  }

  if (!fetchedTx) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center p-4 text-gray-900 font-sans">
        <div className="bg-white border border-gray-100 p-6 sm:p-8 rounded-2xl sm:rounded-3xl max-w-md text-center shadow-xl shadow-gray-200/50">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-50 text-rose-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mx-auto mb-3">
            🔍
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">Invoice Tidak Ditemukan!</h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-5">
            Nomor Invoice <strong className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-900">&quot;{invoiceId}&quot;</strong> tidak terdaftar dalam sistem.
          </p>
          {fetchError && (
            <p className="text-[10px] font-mono text-rose-500 bg-rose-50 p-2 rounded-lg mb-4">
              Log Error: {fetchError}
            </p>
          )}
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all"
          >
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  let transaction: Transaction = fetchedTx;

  // 1. HITUNG BATAS WAKTU 120 MENIT
  const createdTime = parseTimestamp(transaction.created_at);
  const currentTime = await getCurrentTimestamp();
  const EXPIRE_LIMIT_MS = 120 * 60 * 1000; // 120 Menit = 7.200.000 ms
  const isTimeExpired = (currentTime - createdTime) > EXPIRE_LIMIT_MS;

  let currentPaymentStatus = (transaction.payment_status || 'PENDING').toUpperCase();
  let currentDeliveryStatus = (transaction.delivery_status || 'PENDING').toUpperCase();
  let currentAccountDetails = transaction.digital_account_details || '';

  let isPaid = currentPaymentStatus === 'PAID' || currentPaymentStatus === 'SUCCESS' || currentPaymentStatus === 'LUNAS';
  let isDbExpired = ['EXPIRED', 'EXPIRE', 'KADALUWARSA', 'CANCELLED', 'BATAL', 'FAILED'].includes(currentPaymentStatus);

  // 2. CEK STATUS DAN SINKRONISASI SUPABASE
  if (!isPaid && !isDbExpired) {
    const premkuDepositId = extractPremkuDepositId(transaction.api_response_log);
    let depositIsPaid = false;

    if (premkuDepositId) {
      try {
        // SOLUSI FIX TS2339: Berikan tipe 'any' untuk hasil eksekusi API Premku
        const depositStatusResult: any = await checkDepositStatus(premkuDepositId);
        depositIsPaid = typeof depositStatusResult === 'boolean' 
          ? depositStatusResult 
          : Boolean(depositStatusResult?.isPaid);
      } catch (e) {
        console.error('Error auto checking deposit:', e);
      }
    }

    if (depositIsPaid) {
      let updatedDelivery = currentDeliveryStatus;
      let updatedDetails = currentAccountDetails;

      if (updatedDelivery !== 'SUCCESS') {
        try {
          if (updatedDelivery === 'PENDING' || !updatedDetails) {
            const orderRes = await createProductOrder({
              productId: transaction.api_product_id || '',
              targetWa: transaction.customer_wa || '',
              invoiceNumber: transaction.invoice_number
            });
            if (orderRes.isReady) {
              updatedDelivery = 'SUCCESS';
              updatedDetails = orderRes.accountDetails || '';
            } else {
              updatedDelivery = 'PROCESS';
              updatedDetails = orderRes.accountDetails || '';
            }
          }

          if (updatedDelivery === 'PROCESS') {
            const statusCheck = await checkOrderStatus(transaction.invoice_number);
            if (statusCheck.isReady && statusCheck.accountDetails) {
              updatedDelivery = 'SUCCESS';
              updatedDetails = statusCheck.accountDetails;
            }
          }
        } catch (e) {
          console.error('Error auto ordering product:', e);
        }
      }

      const totalPrice = Number(transaction.total_price) || 0;
      const baseCostPrice = Number(transaction.base_cost_price || transaction.cost_price || 0);
      const calculatedMargin = updatedDelivery === 'SUCCESS' 
        ? Math.max(0, totalPrice - baseCostPrice) 
        : (Number(transaction.margin) || 0);

      const { data: updatedTx } = await supabase
        .from('transactions')
        .update({
          payment_status: 'PAID',
          delivery_status: updatedDelivery,
          digital_account_details: updatedDetails,
          margin: calculatedMargin,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id)
        .select()
        .maybeSingle();

      if (updatedTx) {
        transaction = updatedTx as unknown as Transaction;
        currentPaymentStatus = 'PAID';
        currentDeliveryStatus = updatedDelivery;
        currentAccountDetails = updatedDetails;
        isPaid = true;
      }
    } 
    else if (isTimeExpired) {
      const { data: expiredTx } = await supabase
        .from('transactions')
        .update({
          payment_status: 'EXPIRED',
          delivery_status: 'FAILED',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id)
        .select()
        .maybeSingle();

      if (expiredTx) {
        transaction = expiredTx as unknown as Transaction;
      } else {
        transaction = {
          ...transaction,
          payment_status: 'EXPIRED',
          delivery_status: 'FAILED',
        };
      }
      currentPaymentStatus = 'EXPIRED';
      currentDeliveryStatus = 'FAILED';
      isDbExpired = true;
    }
  }

  const isExpired = isDbExpired || (!isPaid && isTimeExpired);
  const isPending = !isPaid && !isExpired;

  // Ekstraksi QRIS
  let qrCodeUrl: string | null = null;
  let checkoutUrl: string | null = null;

  if (transaction.api_response_log) {
    try {
      const parsedLog = typeof transaction.api_response_log === 'string' 
        ? JSON.parse(transaction.api_response_log) 
        : transaction.api_response_log;

      qrCodeUrl = parsedLog?.qr_url 
        || parsedLog?.qris_url 
        || parsedLog?.qr_image 
        || parsedLog?.qr_code 
        || parsedLog?.data?.qr_url 
        || parsedLog?.data?.qris_url 
        || parsedLog?.data?.qr_image 
        || parsedLog?.data?.qr_code 
        || null;

      checkoutUrl = parsedLog?.checkout_url 
        || parsedLog?.payment_url 
        || parsedLog?.data?.checkout_url 
        || parsedLog?.data?.payment_url 
        || null;

      const rawQrString = parsedLog?.qr_string 
        || parsedLog?.qr_content 
        || parsedLog?.data?.qr_string 
        || parsedLog?.data?.qr_content;

      if (!qrCodeUrl && rawQrString) {
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(rawQrString)}`;
      }
    } catch (e) {
      console.error("Gagal parsing api_response_log:", e);
    }
  }

  const formattedDate = new Date(transaction.created_at).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 font-sans overflow-hidden relative selection:bg-indigo-500/20 pb-16 sm:pb-24">
      
      {/* Background Soft Glow */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[500px] h-[280px] sm:w-[600px] sm:h-[350px] rounded-full bg-gradient-to-b from-indigo-300/20 via-purple-300/10 to-transparent blur-[100px] pointer-events-none"></div>

      <main className="relative max-w-xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">

        {/* KARTU INVOICE */}
        <div className="bg-white border border-gray-100/80 rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
          
          {/* Header Invoice */}
          <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-white p-4 sm:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1">
                  Invoice Resmi
                </span>
                <h1 className="text-base sm:text-xl font-black font-mono tracking-tight">#{transaction.invoice_number}</h1>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{formattedDate} WIB</p>
              </div>

              <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-sm ${
                isPaid 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : isPending 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {isPaid ? '🟢 Lunas' : isPending ? '🟡 Waiting' : '🔴 Expired'}
              </span>
            </div>
          </div>

          {/* Rincian Transaksi */}
          <div className="p-4 sm:p-6 space-y-4">
            
            <div className="bg-slate-50/80 border border-slate-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium"> Produk</span>
                <span className="font-extrabold text-gray-900 text-right">{transaction.product_name}</span>
              </div>
              
              {transaction.customer_wa && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">No. WhatsApp</span>
                  <span className="font-bold text-gray-700">{transaction.customer_wa}</span>
                </div>
              )}

              {transaction.customer_email && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Email</span>
                  <span className="font-bold text-gray-700">{transaction.customer_email}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Metode Pembayaran</span>
                <span className="font-bold text-indigo-700">{transaction.payment_channel || 'QRIS / Otomatis'}</span>
              </div>

              <div className="flex justify-between items-center text-xs pt-2.5 border-t border-slate-200/60">
                <span className="text-gray-700 font-bold">Total Pembayaran</span>
                <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700">
                  Rp {Number(transaction.total_price || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* STATUS EXPIRED */}
            {isExpired && (
              <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-inner">
                  ⌛
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-rose-900">Masa Pembayaran Telah Habis</h3>
                  <p className="text-xs text-rose-700 leading-relaxed max-w-xs mx-auto font-medium">
                    Batas waktu pembayaran 120 menit telah lewat. QRIS ini sudah kadaluwarsa dan tidak dapat dibayar.
                  </p>
                </div>
                <Link 
                  href="/"
                  className="inline-flex items-center justify-center gap-1.5 w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all"
                >
                  <span>Buat Pesanan Baru</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}

            {/* STATUS PENDING / TAMPILAN QRIS DENGAN SILENT INLINE AUTO-CHECK */}
            {isPending && (
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl sm:rounded-2xl p-4 text-center space-y-3">
                
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      (function() {
                        if (window.__qrisTimer) clearInterval(window.__qrisTimer);
                        window.__qrisTimer = setInterval(async function() {
                          try {
                            var res = await fetch('/api/check-payment', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ invoiceNumber: '${transaction.invoice_number}' })
                            });
                            var data = await res.json();
                            if (data && (data.status === 'PAID' || data.status === 'EXPIRED')) {
                              clearInterval(window.__qrisTimer);
                              window.location.reload();
                            }
                          } catch (e) {}
                        }, 4000);
                      })();
                    `,
                  }}
                />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                  Pindai QRIS (Mengecek Otomatis - 120 Menit)
                </div>

                {qrCodeUrl ? (
                  <div className="space-y-3">
                    <input type="checkbox" id="qris-toggle" className="peer hidden" />

                    <label 
                      htmlFor="qris-toggle"
                      className="block w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-white p-2.5 rounded-2xl border border-indigo-100 shadow-md cursor-pointer relative group transition-transform hover:scale-[1.02]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={qrCodeUrl} 
                        alt="QRIS Pembayaran Ornot Prem" 
                        className="w-full h-full object-contain rounded-xl"
                      />
                      <div className="absolute inset-0 bg-indigo-950/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-extrabold backdrop-blur-[2px]">
                        🔍 Klik Perbesar
                      </div>
                    </label>

                    <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                      <label 
                        htmlFor="qris-toggle"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold py-2 px-3 rounded-xl text-xs cursor-pointer transition-colors border border-indigo-100"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Perbesar
                      </label>

                      <a 
                        href={qrCodeUrl} 
                        download={`QRIS-${transaction.invoice_number}.png`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold py-2 px-3 rounded-xl text-xs transition-all shadow-sm shadow-indigo-600/20"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Unduh QRIS
                      </a>
                    </div>

                    {/* MODAL POPUP LIGHTBOX PURE CSS */}
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden peer-checked:flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 text-center relative shadow-2xl">
                        <label 
                          htmlFor="qris-toggle" 
                          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-600 text-sm font-bold cursor-pointer transition-colors"
                        >
                          ✕
                        </label>
                        <h3 className="text-sm font-extrabold text-gray-900 border-b pb-2 border-gray-100">
                          QRIS #{transaction.invoice_number}
                        </h3>
                        <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={qrCodeUrl} 
                            alt="QRIS Pembayaran Besar" 
                            className="w-full h-auto object-contain mx-auto rounded-xl"
                          />
                        </div>
                        <a 
                          href={qrCodeUrl} 
                          download={`QRIS-${transaction.invoice_number}.png`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Unduh Gambar QRIS
                        </a>
                      </div>
                    </div>

                  </div>
                ) : checkoutUrl ? (
                  <a 
                    href={checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all"
                  >
                    <span>Bayar Sekarang (Klik Di Sini)</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl font-medium border border-amber-200">
                    Sistem sedang memproses QRIS. Silakan muat ulang halaman dalam beberapa detik.
                  </p>
                )}

                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Buka aplikasi e-wallet (Gopay, OVO, Dana, ShopeePay) atau Mobile Banking, pilih <strong>Scan QRIS</strong>, lalu selesaikan pembayaran. Status akan terupdate otomatis!
                </p>
              </div>
            )}

            {/* DETAIL AKUN DIGITAL (JIKA LUNAS) */}
            {isPaid && currentAccountDetails && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl sm:rounded-2xl p-4 text-emerald-900 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold flex items-center gap-1.5 text-emerald-800">
                    <span>🎉</span> Detail Akun Premium Anda:
                  </p>
                  <span className="text-[9px] font-bold bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded uppercase">
                    Aktif / Terkirim
                  </span>
                </div>
                <pre className="text-xs font-mono bg-white p-3 rounded-xl border border-emerald-200/80 overflow-x-auto whitespace-pre-wrap select-all text-gray-800 shadow-inner">
                  {currentAccountDetails}
                </pre>
              </div>
            )}

            {/* STATUS PENGIRIMAN */}
            {currentDeliveryStatus && (
              <div className="flex justify-between items-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-gray-500 font-medium">Status Pengiriman Akun:</span>
                <span className="font-extrabold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {currentDeliveryStatus}
                </span>
              </div>
            )}

            {/* TOMBOL CS WHATSAPP & BERANDA */}
            <div className="pt-2 flex flex-col gap-2">
              <a 
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin Ornot Prem, saya ingin bertanya tentang Invoice #${transaction.invoice_number}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Hubungi Bantuan CS WhatsApp</span>
              </a>

              <Link 
                href="/"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-2.5 rounded-xl text-xs text-center transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}