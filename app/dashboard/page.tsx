// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserData {
  id: string;
  balance: number;
}

interface TransactionItem {
  id: string;
  invoice_number: string;
  product_name: string;
  total_price: number;
  payment_status: string;
  delivery_status: string;
  created_at: string;
}

interface DepositItem {
  id: string;
  invoice_number: string;
  total_transfer: number;
  payment_channel: string;
  status: string;
  created_at: string;
}

export default function UserDashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [myOrders, setMyOrders] = useState<TransactionItem[]>([]);
  const [myDeposits, setMyDeposits] = useState<DepositItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const sessionStr = localStorage.getItem('user_session');
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);
      
      const [userRes, txRes, depRes] = await Promise.all([
        supabase.from('users').select('id, balance').eq('id', session.id).single(),
        supabase.from('transactions').select('*').eq('user_id', session.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('deposits').select('*').eq('user_id', session.id).order('created_at', { ascending: false }).limit(5)
      ]);

      if (userRes.data) setUser(userRes.data);
      if (txRes.data) setMyOrders(txRes.data);
      if (depRes.data) setMyDeposits(depRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* --- KARTU SALDO & STATISTIK --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wallet Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-6 shadow-xl shadow-indigo-900/30 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM3 18V6h18v12H3zm2-8h14v2H5v-2zm0 4h7v2H5v-2z" /></svg>
          </div>
          <div>
            <p className="text-indigo-200 text-xs uppercase tracking-wider font-semibold mb-1">Saldo Tersedia</p>
            <h2 className="text-3xl font-black tracking-tight">Rp {Number(user?.balance || 0).toLocaleString('id-ID')}</h2>
          </div>
          <button className="mt-8 w-full bg-white/20 hover:bg-white/30 backdrop-blur-md py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg">
            + Top Up Saldo
          </button>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-800/80 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Pesanan Sukses</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">
                {myOrders.filter(o => o.delivery_status === 'SUCCESS').length} <span className="text-xs font-normal text-slate-500">Layanan</span>
              </h3>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-800/80 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Belanja</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">
                Rp {myOrders.filter(o => o.payment_status === 'PAID' || o.payment_status === 'SUCCESS').reduce((acc, curr) => acc + Number(curr.total_price), 0).toLocaleString('id-ID')}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* --- TABEL DATA MODERN --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tabel Pesanan */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-800/80 shadow-lg overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Pesanan Terakhir
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/20 text-slate-400 text-xs">
                <tr>
                  <th className="px-6 py-3 font-semibold">Produk</th>
                  <th className="px-6 py-3 font-semibold">Harga</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {myOrders.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Belum ada riwayat pesanan.</td></tr>
                ) : (
                  myOrders.map((order) => {
                    const isSuccess = order.delivery_status === 'SUCCESS';
                    const isProcess = order.delivery_status === 'PROCESS';
                    
                    return (
                      <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-200">{order.product_name}</p>
                          <p className="text-[11px] text-slate-500">{order.invoice_number}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          Rp {Number(order.total_price).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            isProcess ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {order.delivery_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Top Up */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-800/80 shadow-lg overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Riwayat Top Up
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/20 text-slate-400 text-xs">
                <tr>
                  <th className="px-6 py-3 font-semibold">Channel / Tanggal</th>
                  <th className="px-6 py-3 font-semibold">Nominal</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {myDeposits.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Belum ada riwayat top up.</td></tr>
                ) : (
                  myDeposits.map((dep) => {
                    const isSuccess = dep.status === 'SUCCESS';
                    const isPending = dep.status === 'PENDING';
                    const date = new Date(dep.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

                    return (
                      <tr key={dep.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-200">{dep.payment_channel}</p>
                          <p className="text-[11px] text-slate-500">{date}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          + Rp {Number(dep.total_transfer).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {dep.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}