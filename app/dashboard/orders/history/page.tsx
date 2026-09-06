// app/dashboard/orders/history/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Transaction {
  id: string;
  invoice_number: string;
  product_name: string;
  customer_wa: string;
  total_price: number;
  payment_status: string;
  delivery_status: string;
  created_at: string;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      const sessionStr = localStorage.getItem('user_session');
      if (!sessionStr) { router.push('/login'); return; }
      const session = JSON.parse(sessionStr);

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', session.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Gagal memuat riwayat transaksi.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  return (
    <div className="max-w-6xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER PAGE */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Riwayat Transaksi</h1>
          <p className="text-sm text-slate-400 mt-1">Daftar pesanan produk yang pernah kamu buat.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/orders')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all"
        >
          + Buat Order Baru
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}

      {/* TABLE / CONTENT */}
      <div className="bg-[#1e293b] rounded-[2rem] border border-slate-700/50 shadow-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            Memuat riwayat pesanan...
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-center mb-4 text-slate-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-slate-300 font-bold mb-1">Belum ada transaksi</p>
            <p className="text-slate-400 text-sm max-w-sm">Kamu belum pernah melakukan checkout produk. Silakan buat pesanan pertamamu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/60 bg-[#0f172a]/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-6">Invoice / Tanggal</th>
                  <th className="py-4 px-6">Produk</th>
                  <th className="py-4 px-6">Tujuan (WA)</th>
                  <th className="py-4 px-6">Total Harga</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-sm">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-white font-mono">{tx.invoice_number}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-200">
                      {tx.product_name}
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                      {tx.customer_wa}
                    </td>
                    <td className="py-4 px-6 font-black text-white">
                      Rp {Number(tx.total_price).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tx.delivery_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}