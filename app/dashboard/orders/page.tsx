// app/dashboard/orders/page.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

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
  
  // State untuk menyimpan margin setting dari database
  const [minMargin, setMinMargin] = useState<number>(500); 
  const [maxMargin, setMaxMargin] = useState<number>(1000); 

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fungsi margin konsisten berdasarkan string produk agar harganya tetap stabil
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

      // 1. Ambil Data User dan Settings (Min & Max Margin) secara Bersamaan
      const [userRes, settingsRes] = await Promise.all([
        supabase.from('users').select('id, balance').eq('id', session.id).single(),
        supabase.from('settings').select('key_name, value').in('key_name', ['min_margin', 'max_margin'])
      ]);

      if (userRes.data) setUser(userRes.data);

      // 2. Terapkan Nilai dari Tabel Settings
      if (settingsRes.data) {
        settingsRes.data.forEach((item) => {
          if (item.key_name === 'min_margin' && !isNaN(Number(item.value))) setMinMargin(Number(item.value));
          if (item.key_name === 'max_margin' && !isNaN(Number(item.value))) setMaxMargin(Number(item.value));
        });
      }

      // 3. Ambil Produk dari Premku API
      try {
        const res = await fetch('https://premku.com/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_PREMKU_API_KEY || '', 
          },
          body: JSON.stringify({}),
          cache: 'no-store',
        });
        const result = await res.json();
        
        let rawProducts: PremkuProduct[] = [];
        if (Array.isArray(result)) rawProducts = result;
        else if (result && Array.isArray(result.data)) rawProducts = result.data;
        else if (result && Array.isArray(result.products)) rawProducts = result.products;

        setProducts(rawProducts);
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    initData();
  }, [router]);

  const currentProduct = products.find(p => p.id === Number(selectedProductId));
  
  // Hitung margin konsisten berdasarkan nama produk yang dipilih
  const randomMarginApplied = useMemo(() => {
    if (!currentProduct) return 0;
    const brandName = currentProduct.name ? currentProduct.name.split(' ')[0] : 'Lainnya';
    return getConsistentMargin(brandName, minMargin, maxMargin);
  }, [currentProduct, minMargin, maxMargin]);

  const finalPricePerItem = currentProduct ? (Number(currentProduct.price) || 0) + randomMarginApplied : 0;
  const totalPrice = finalPricePerItem * qty;
  const isOutOfStock = currentProduct ? (currentProduct.stock <= 0 || currentProduct.status === 'unavailable') : false;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); setSuccessMessage('');

    if (!currentProduct || isOutOfStock) { setErrorMessage('Produk tidak tersedia atau stok habis.'); return; }
    if (Number(user?.balance || 0) < totalPrice) { setErrorMessage('Saldo Anda tidak mencukupi untuk melakukan transaksi ini.'); return; }
    if (!customerWa) { setErrorMessage('Masukkan nomor WhatsApp tujuan.'); return; }

    setIsSubmitting(true);
    try {
      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      const uniqueRefId = `INV-${Date.now()}`;

      // Eksekusi order ke API Premku
      const res = await fetch('https://premku.com/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_PREMKU_API_KEY || '',
        },
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

      // Simpan transaksi ke database Supabase
      const { error: insertError } = await supabase.from('transactions').insert([{
        user_id: session.id,
        invoice_number: premkuData.invoice || uniqueRefId,
        product_name: currentProduct.name,
        customer_wa: customerWa,
        base_price: currentProduct.price,
        margin: totalProfitEarned,
        total_price: totalPrice,
        payment_status: 'PAID',
        delivery_status: 'SUCCESS'
      }]);

      if (insertError) throw new Error(insertError.message);

      // Potong saldo user di database
      const newBalance = Number(user?.balance) - totalPrice;
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', session.id)
        .select()
        .single();
      
      if (updateError) throw new Error(updateError.message);

      setUser(updatedUser);
      setSuccessMessage(`Pesanan Berhasil! No Invoice: ${premkuData.invoice || uniqueRefId}`);
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
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Buat Pesanan Baru</h1>
      
      {successMessage && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">{successMessage}</div>}
      {errorMessage && <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">{errorMessage}</div>}

      <div className="bg-[#1e293b] rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl">
        <form onSubmit={handleCheckout} className="space-y-6">
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Pilih Produk</label>
            {isLoadingProducts ? (
              <p className="text-sm text-slate-400 animate-pulse">Memuat daftar produk...</p>
            ) : (
              <select 
                value={selectedProductId} 
                onChange={(e) => setSelectedProductId(e.target.value)} 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
                required
              >
                <option value="">-- Pilih Produk Premium --</option>
                {products.map((prod) => {
                  const isEmptied = prod.stock <= 0 || prod.status === 'unavailable';
                  return (
                    <option key={prod.id} value={prod.id} disabled={isEmptied} className={isEmptied ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
                      {prod.name} — {isEmptied ? 'HABIS (Out of Stock)' : `TERSEDIA (Stok: ${prod.stock})`}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Jumlah (Qty)</label>
              <input 
                type="number" 
                min="1" 
                value={qty} 
                onChange={(e) => setQty(Number(e.target.value))} 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Nomor WhatsApp Tujuan</label>
              <input 
                type="text" 
                value={customerWa} 
                onChange={(e) => setCustomerWa(e.target.value)} 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
                placeholder="08xxxxxxxxxx" 
                required
              />
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Saldo Anda:</span>
              <span className="font-semibold text-emerald-400">Rp {Number(user?.balance || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Harga Satuan (Nett):</span>
              <span className="font-medium text-slate-200">Rp {finalPricePerItem.toLocaleString('id-ID')} /item</span>
            </div>
            <div className="border-t border-slate-800/80 pt-2 flex justify-between font-bold text-white text-base">
              <span>Total Pembayaran:</span>
              <span className="text-indigo-400">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || isOutOfStock || isLoadingProducts} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-3.5 rounded-xl text-white font-bold text-sm disabled:bg-slate-700 transition-colors cursor-pointer"
          >
            {isSubmitting ? 'Memproses Pesanan...' : 'Konfirmasi Pesanan'}
          </button>
        </form>
      </div>
    </div>
  );
}