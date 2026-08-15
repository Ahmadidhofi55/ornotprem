// app/dashboard/orders/page.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// --- DEKLARASI GLOBAL META PIXEL ---
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}
// -----------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserData {
  id: string;
  balance: number;
}

interface PremkuProduct {
  id: number;
  name: string;
  price: number;
  status: string;
  stock: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [products, setProducts] = useState<PremkuProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [customerWa, setCustomerWa] = useState('');
  
  const [minMargin, setMinMargin] = useState<number>(500); 
  const [maxMargin, setMaxMargin] = useState<number>(1000); 

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getConsistentMargin = (productName: string, min: number, max: number) => {
    const diff = max - min;
    const steps = diff > 0 ? Math.floor(diff / 100) + 1 : 1;
    
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
      hash = productName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return min + (Math.abs(hash) % steps) * 100;
  };

  useEffect(() => {
    const initData = async () => {
      const sessionStr = localStorage.getItem('user_session');
      if (!sessionStr) { router.push('/login'); return; }
      const session = JSON.parse(sessionStr);

      try {
        const [userRes, settingsRes] = await Promise.all([
          supabase.from('users').select('id, balance').eq('id', session.id).single(),
          supabase.from('settings').select('key_name, value').in('key_name', ['min_margin', 'max_margin'])
        ]);

        if (userRes.data) setUser(userRes.data);

        if (settingsRes.data) {
          settingsRes.data.forEach((item) => {
            if (item.key_name === 'min_margin' && !isNaN(Number(item.value))) setMinMargin(Number(item.value));
            if (item.key_name === 'max_margin' && !isNaN(Number(item.value))) setMaxMargin(Number(item.value));
          });
        }

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        const result = await res.json();
        
        let rawProducts: PremkuProduct[] = [];
        if (Array.isArray(result)) rawProducts = result;
        else if (result && Array.isArray(result.data)) rawProducts = result.data;
        else if (result && Array.isArray(result.products)) rawProducts = result.products;

        setProducts(rawProducts);
      } catch (err) {
        console.error("Gagal memuat produk:", err);
        setErrorMessage("Gagal terhubung ke server produk.");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    initData();
  }, [router]);

  const currentProduct = products.find(p => p.id === Number(selectedProductId));
  
  const randomMarginApplied = useMemo(() => {
    if (!currentProduct) return 0;
    const brandName = currentProduct.name ? currentProduct.name.split(' ')[0] : 'Lainnya';
    return getConsistentMargin(brandName, minMargin, maxMargin);
  }, [currentProduct, minMargin, maxMargin]);

  const finalPricePerItem = currentProduct ? (Number(currentProduct.price) || 0) + randomMarginApplied : 0;
  const totalPrice = finalPricePerItem * qty;
  const isOutOfStock = currentProduct ? (currentProduct.stock <= 0 || currentProduct.status === 'unavailable') : false;
  
  // LOGIKA STATUS SALDO
  const userBalance = Number(user?.balance || 0);
  const isInsufficientBalance = currentProduct ? userBalance < totalPrice : false;

  const incrementQty = () => setQty(prev => prev + 1);
  const decrementQty = () => setQty(prev => (prev > 1 ? prev - 1 : 1));

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); setSuccessMessage('');

    if (!currentProduct || isOutOfStock) { setErrorMessage('Produk tidak tersedia atau stok habis.'); return; }
    if (isInsufficientBalance) { setErrorMessage('Saldo Anda tidak mencukupi untuk melakukan transaksi ini.'); return; }
    if (!customerWa) { setErrorMessage('Masukkan nomor WhatsApp tujuan.'); return; }

    setIsSubmitting(true);

    // --- 1. META PIXEL: Track InitiateCheckout saat menekan Konfirmasi ---
    // Di sini value tetap asli agar FB tahu niat belanjanya sebesar apa
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: currentProduct.name,
        value: totalPrice,
        currency: 'IDR',
        num_items: qty
      });
    }
    // ------------------------------------------------------------------------

    try {
      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      const uniqueRefId = `INV-${Date.now()}`;

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: currentProduct.id,
          qty: qty,
          ref_id: uniqueRefId,
          target: customerWa
        })
      });

      const premkuData = await res.json();
      if (!premkuData.success && !premkuData.invoice) {
        throw new Error(premkuData.message || 'Gagal memproses pesanan ke server pusat.');
      }

      const totalProfitEarned = randomMarginApplied * qty;
      const invoiceToUse = premkuData.invoice || uniqueRefId;

      const { error: insertError } = await supabase.from('transactions').insert([{
        user_id: session.id,
        invoice_number: invoiceToUse,
        product_name: currentProduct.name,
        customer_wa: customerWa,
        base_price: currentProduct.price,
        margin: totalProfitEarned,
        total_price: totalPrice,
        payment_status: 'PAID',
        delivery_status: 'SUCCESS'
      }]);

      if (insertError) throw new Error(insertError.message);

      const newBalance = userBalance - totalPrice;
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', session.id)
        .select()
        .single();
      
      if (updateError) throw new Error(updateError.message);

      // --- 2. META PIXEL: Track Purchase saat pesanan sukses ---
      // VALUE: 0 (Nol) -> Agar ROAS di Iklan FB tidak double dengan uang Top Up
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', {
          value: 0, 
          currency: 'IDR',
          content_name: currentProduct.name,
          order_id: invoiceToUse
        });
        console.log("🔥 Meta Pixel 'Purchase' Fired (Value: 0) untuk Order Pakai Saldo!");
      }
      // -----------------------------------------------------------------------

      setUser(updatedUser);
      setSuccessMessage(`Pesanan Berhasil! No Invoice: ${invoiceToUse}`);
      setSelectedProductId(''); 
      setQty(1); 
      setCustomerWa('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER PAGE */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Checkout Produk</h1>
          <p className="text-sm text-slate-400 mt-1">Selesaikan pesanan kamu dalam hitungan detik.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          100% Secure Checkout
        </div>
      </div>

      {/* ALERTS */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-3 shadow-lg">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-3 shadow-lg">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* DUAL COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: INPUT FORM */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-[#1e293b] rounded-[2rem] p-6 sm:p-8 border border-slate-700/50 shadow-2xl">
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-700/50">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner border border-indigo-500/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Pilih Pesanan</h2>
          </div>

          <form id="orderForm" onSubmit={handleCheckout} className="space-y-6">
            {/* Produk */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Katalog Layanan</label>
              {isLoadingProducts ? (
                <div className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-4 py-4 text-sm text-slate-500 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  Memuat katalog produk...
                </div>
              ) : (
                <div className="relative">
                  <select 
                    value={selectedProductId} 
                    onChange={(e) => setSelectedProductId(e.target.value)} 
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer font-medium" 
                    required
                  >
                    <option value="" disabled hidden>Ketuk untuk mencari produk...</option>
                    {products.map((prod) => {
                      const isEmptied = prod.stock <= 0 || prod.status === 'unavailable';
                      return (
                        <option key={prod.id} value={prod.id} disabled={isEmptied}>
                          {prod.name} {isEmptied ? '(HABIS)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              )}
            </div>

            {/* WA dan Qty (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
              
              <div className="sm:col-span-8">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Nomor WhatsApp</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-emerald-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </div>
                  <input 
                    type="text" 
                    value={customerWa} 
                    onChange={(e) => setCustomerWa(e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" 
                    placeholder="Contoh: 6285724486120" 
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Kuantitas</label>
                <div className="flex items-center bg-[#0f172a] border border-slate-700 rounded-2xl overflow-hidden h-[54px]">
                  <button type="button" onClick={decrementQty} className="w-14 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-r border-slate-700 font-bold text-lg select-none">
                    -
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value={qty} 
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} 
                    className="w-full h-full bg-transparent text-center text-sm font-bold text-white focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
                    style={{ MozAppearance: 'textfield' }} // Hilangkan panah spinner bawaan browser
                  />
                  <button type="button" onClick={incrementQty} className="w-14 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-l border-slate-700 font-bold text-lg select-none">
                    +
                  </button>
                </div>
              </div>

            </div>
          </form>
        </div>


        {/* ======================================================== */}
        {/* RIGHT COLUMN: ORDER RECEIPT */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-[#0b1120] rounded-[2rem] p-6 sm:p-8 shadow-2xl flex flex-col justify-between sticky top-24 border border-slate-800/80 min-h-[480px]">
          
          <div>
            <div className="flex items-center justify-between mb-8 border-b border-slate-800/50 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-white">Detail Order</h2>
              </div>
              <div className="bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-1.5 flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Saldo Aktif</span>
                <span className="text-emerald-400 font-black text-sm tracking-tight">Rp {userBalance.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Content Receipt */}
            {!currentProduct ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <p className="text-slate-400 text-sm max-w-[200px] leading-relaxed">
                  Pilih produk di samping untuk melihat rincian.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start pb-4 border-b border-slate-800/80">
                  <div className="pr-4">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Item</p>
                    <p className="font-bold text-slate-200">{currentProduct.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Harga Satuan</p>
                    <p className="font-semibold text-slate-300">Rp {finalPricePerItem.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
                  <p className="text-sm font-semibold text-slate-400">Kuantitas</p>
                  <p className="text-sm font-bold text-white">x {qty}</p>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
                  <p className="text-sm font-semibold text-slate-400">Ketersediaan Stok</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${isOutOfStock ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {isOutOfStock ? 'HABIS' : 'TERSEDIA'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex justify-between items-end mb-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tagihan</p>
              <p className={`text-3xl font-black tracking-tight ${isInsufficientBalance ? 'text-rose-400' : 'text-white'}`}>
                Rp {totalPrice.toLocaleString('id-ID')}
              </p>
            </div>

            {/* KONDISI TOMBOL BAWAH */}
            {!currentProduct ? (
              <button disabled className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700">
                PILIH PRODUK DAHULU
              </button>
            ) : isOutOfStock ? (
              <button disabled className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all bg-rose-500/10 text-rose-400 cursor-not-allowed border border-rose-500/20">
                STOK PRODUK HABIS
              </button>
            ) : isInsufficientBalance ? (
              <div className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                SALDO TIDAK CUKUP
              </div>
            ) : (
              <button 
                type="submit" 
                form="orderForm"
                disabled={isSubmitting} 
                className={`w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all ${
                  isSubmitting 
                    ? 'bg-indigo-600/50 text-white cursor-wait'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? 'MEMPROSES PESANAN...' : 'KONFIRMASI PESANAN'}
              </button>
            )}

          </div>

        </div>
        
      </div>
    </div>
  );
}