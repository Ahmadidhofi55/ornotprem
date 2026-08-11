// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserData {
  id: string;
  balance: number;
  full_name: string;
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
        supabase.from('users').select('id, balance, full_name').eq('id', session.id).single(),
        supabase.from('transactions').select('*').eq('user_id', session.id).order('created_at', { ascending: false }).limit(4),
        supabase.from('deposits').select('*').eq('user_id', session.id).order('created_at', { ascending: false }).limit(4)
      ]);

      if (userRes.data) setUser(userRes.data);
      if (txRes.data) setMyOrders(txRes.data);
      if (depRes.data) setMyDeposits(depRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Fungsi pembuat inisial (Contoh: "Netflix Premium" -> "N")
  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

  if (isLoading) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400 animate-pulse">Menyiapkan Dashboard...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.full_name?.split(' ')[0] || 'Member';
  const totalSpent = myOrders.filter(o => o.payment_status === 'PAID' || o.payment_status === 'SUCCESS').reduce((acc, curr) => acc + Number(curr.total_price), 0);
  const successOrdersCount = myOrders.filter(o => o.delivery_status === 'SUCCESS').length;

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* --- HEADER GREETING --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{firstName}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Ringkasan akun dan aktivitas transaksi premium Anda.</p>
        </div>
        <Link href="/dashboard/orders" className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/25">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Order Baru
        </Link>
      </div>

      {/* --- BENTO GRID STATISTIK --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Wallet Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 rounded-[2rem] p-6 shadow-xl shadow-indigo-900/30 text-white relative overflow-hidden flex flex-col justify-between border border-white/10">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-3xl"></div>
          
          <div className="relative z-10 flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-semibold tracking-wider text-indigo-50">SALDO AKTIF</span>
            </div>
            <svg className="w-7 h-7 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          
          <div className="relative z-10 mb-8">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-lg flex items-center gap-1.5">
              <span className="text-xl text-indigo-200 font-bold">Rp</span>
              {Number(user?.balance || 0).toLocaleString('id-ID')}
            </h2>
          </div>

          <Link href="/dashboard/topup" className="relative z-10 w-full flex items-center justify-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] py-3.5 rounded-xl text-sm font-bold transition-all shadow-xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Isi Saldo
          </Link>
        </div>

        {/* Info Cards Column */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          
          {/* Total Belanja */}
          <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-[2rem] p-6 border border-slate-700/50 shadow-xl flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 border border-amber-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Pembelian</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1.5">
              <span className="text-lg text-slate-500 font-bold">Rp</span>
              {totalSpent.toLocaleString('id-ID')}
            </h3>
          </div>

          {/* Layanan Aktif */}
          <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-[2rem] p-6 border border-slate-700/50 shadow-xl flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Pesanan Berhasil</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-2">
              {successOrdersCount} 
              <span className="text-sm font-medium text-slate-500 lowercase tracking-normal">Transaksi</span>
            </h3>
          </div>

        </div>
      </div>

      {/* --- RECENT ACTIVITY SECTION (LIST STYLE MODERN) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Kolom 1: Pesanan Terakhir */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
              Pesanan Terakhir
            </h3>
            <Link href="/dashboard/orders" className="text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 py-1.5 px-3 rounded-full hover:bg-indigo-500/10 transition-colors">Semua</Link>
          </div>
          
          <div className="bg-[#1e293b]/50 border border-slate-800/80 rounded-3xl p-2 sm:p-3 shadow-lg flex flex-col gap-2">
            {myOrders.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center px-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <p className="text-slate-400 text-sm font-medium mb-4">Belum ada pesanan.</p>
                <Link href="/dashboard/orders" className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-500/20 transition-colors">Beli Sekarang</Link>
              </div>
            ) : (
              myOrders.map((order) => {
                const isSuccess = order.delivery_status === 'SUCCESS';
                const isProcess = order.delivery_status === 'PROCESS';
                const date = new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                
                return (
                  <div key={order.id} className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-black text-lg shadow-inner shrink-0 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
                        {getInitial(order.product_name)}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm sm:text-base font-bold text-slate-200 line-clamp-1">{order.product_name}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-mono mt-0.5">{order.invoice_number} • {date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                      <p className="text-sm sm:text-base font-bold text-white">Rp {Number(order.total_price).toLocaleString('id-ID')}</p>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : isProcess ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {order.delivery_status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom 2: Top Up Terakhir */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              Riwayat Deposit
            </h3>
            <Link href="/dashboard/deposit-history" className="text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 py-1.5 px-3 rounded-full hover:bg-emerald-500/10 transition-colors">Semua</Link>
          </div>
          
          <div className="bg-[#1e293b]/50 border border-slate-800/80 rounded-3xl p-2 sm:p-3 shadow-lg flex flex-col gap-2">
            {myDeposits.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center px-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-slate-400 text-sm font-medium mb-4">Belum ada riwayat top up.</p>
                <Link href="/dashboard/topup" className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors">Top Up Sekarang</Link>
              </div>
            ) : (
              myDeposits.map((dep) => {
                const isSuccess = dep.status === 'SUCCESS';
                const isPending = dep.status === 'PENDING';
                const date = new Date(dep.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short' });

                return (
                  <div key={dep.id} className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm sm:text-base font-bold text-slate-200 uppercase tracking-wide">{dep.payment_channel}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-mono mt-0.5">{dep.invoice_number} • {date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                      <p className="text-sm sm:text-base font-bold text-emerald-400">+ Rp {Number(dep.total_transfer).toLocaleString('id-ID')}</p>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {dep.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}