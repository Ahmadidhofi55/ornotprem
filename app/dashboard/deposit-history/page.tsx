// app/dashboard/deposit-history/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface DepositRecord {
  id: string;
  invoice_number: string;
  total_transfer: number;
  payment_channel: string;
  status: string;
  created_at: string;
}

export default function DepositHistoryPage() {
  const router = useRouter();
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAndSyncDeposits = async () => {
    setIsSyncing(true);
    setMessage('');

    try {
      const sessionStr = localStorage.getItem('user_session');
      if (!sessionStr) { router.push('/login'); return; }
      const session = JSON.parse(sessionStr);

      // 1. Ambil data riwayat deposit dari database Supabase milik user yang sedang login
      const { data: localDeposits, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', session.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!localDeposits || localDeposits.length === 0) {
        setDeposits([]);
        setIsLoading(false);
        setIsSyncing(false);
        return;
      }

      // 2. Cek otomatis transaksi yang masih PENDING ke API Premku via proxy
      const updatedList = [...localDeposits];
      let balanceAddedTotal = 0;

      for (const item of updatedList) {
        if (item.status === 'PENDING') {
          try {
            const res = await fetch('/api/proxy-products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                endpoint: 'pay_status', 
                bodyData: { invoice: item.invoice_number } 
              })
            });
            const json = await res.json();

            if (json.success && (json.data.status === 'success' || json.data.status === 'SUCCESS')) {
              // Update status di database lokal Supabase menjadi SUCCESS
              await supabase
                .from('deposits')
                .update({ status: 'SUCCESS' })
                .eq('invoice_number', item.invoice_number);

              item.status = 'SUCCESS';
              balanceAddedTotal += Number(item.total_transfer);
            } else if (json.success && (json.data.status === 'canceled' || json.data.status === 'CANCELED' || json.data.status === 'expired')) {
              // Update status jika dibatalkan/expired
              await supabase
                .from('deposits')
                .update({ status: 'CANCELED' })
                .eq('invoice_number', item.invoice_number);

              item.status = 'CANCELED';
            }
          } catch (apiErr) {
            console.error(`Gagal sync invoice ${item.invoice_number}:`, apiErr);
          }
        }
      }

      // 3. Jika ada transaksi pending yang sukses terdeteksi saat sync, tambahkan saldo user otomatis
      if (balanceAddedTotal > 0) {
        const { data: currentUser } = await supabase
          .from('users')
          .select('balance')
          .eq('id', session.id)
          .single();

        const currentBalance = Number(currentUser?.balance || 0);
        const newBalance = currentBalance + balanceAddedTotal;

        await supabase
          .from('users')
          .update({ balance: newBalance, updated_at: new Date() })
          .eq('id', session.id);

        setMessage(`Berhasil menyinkronkan! Saldo sebesar Rp ${balanceAddedTotal.toLocaleString('id-ID')} telah ditambahkan.`);
      }

      setDeposits(updatedList);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAndSyncDeposits();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Riwayat Deposit</h1>
          <p className="text-sm text-slate-400 mt-1">Daftar transaksi pengisian saldo dan status sinkronisasi otomatis.</p>
        </div>
        <button 
          onClick={fetchAndSyncDeposits} 
          disabled={isSyncing}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
        >
          {isSyncing ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Sinkronisasi...
            </>
          ) : 'Refresh & Sinkronkan'}
        </button>
      </div>

      {message && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">{message}</div>}

      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Memuat riwayat deposit...</div>
        ) : deposits.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-slate-400 text-sm">Belum ada riwayat transaksi deposit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Invoice</th>
                  <th className="py-3.5 px-6">Tanggal</th>
                  <th className="py-3.5 px-6">Metode</th>
                  <th className="py-3.5 px-6">Total Bayar</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {deposits.map((item) => {
                  const isSuccess = item.status === 'SUCCESS';
                  const isPending = item.status === 'PENDING';
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-mono text-indigo-400 font-medium">{item.invoice_number}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-200">{item.payment_channel}</td>
                      <td className="py-4 px-6 font-bold text-emerald-400">Rp {Number(item.total_transfer).toLocaleString('id-ID')}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isSuccess ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          isPending ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse' :
                          'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}