// app/admin/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserProfile {
  id: string;
  full_name: string;
  whatsapp_number: string;
  balance: number;
  role: string;
}

interface Transaction {
  id: string;
  invoice_number: string;
  product_name: string;
  base_price: number;
  margin: number;
  total_price: number;
  payment_status: string; 
  delivery_status: string; 
  created_at: string;
}

interface SettingItem {
  key_name: string;
  value: string;
}

export default function AdminDashboardPage() {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [settingsList, setSettingsList] = useState<SettingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, txRes, settingsRes] = await Promise.all([
          supabase.from('users').select('*').order('full_name', { ascending: true }),
          supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50), 
          supabase.from('settings').select('*')
        ]);

        setUsersList(usersRes.data || []);
        setTransactionsList(txRes.data || []);
        setSettingsList(settingsRes.data || []);

      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // --- STATISTICS ---
  const totalUsers = usersList.length;
  
  const successTx = transactionsList.filter(tx => ['paid', 'success', 'settled'].includes(tx.payment_status?.toLowerCase()));
  const pendingTx = transactionsList.filter(tx => ['unpaid', 'pending'].includes(tx.payment_status?.toLowerCase()));
  const failedTx = transactionsList.filter(tx => ['failed', 'expired', 'canceled'].includes(tx.payment_status?.toLowerCase()));

  const totalRevenue = successTx.reduce((acc, tx) => acc + Number(tx.total_price || 0), 0);
  const totalProfit = successTx.reduce((acc, tx) => acc + Number(tx.margin || 0), 0);

  // --- CHART DATA PREPARATION (REALTIME) ---
  const revenueByDate = successTx.reduce((acc: Record<string, number>, tx) => {
    if (!tx.created_at) return acc;
    const date = new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    acc[date] = (acc[date] || 0) + Number(tx.total_price || 0);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(revenueByDate).map(date => ({
    name: date,
    Revenue: revenueByDate[date]
  })).reverse(); 

  const pieData = [
    { name: 'Paid', value: successTx.length, color: '#34d399' },
    { name: 'Unpaid', value: pendingTx.length, color: '#fbbf24' },
    { name: 'Failed', value: failedTx.length, color: '#fb7185' },
  ].filter(item => item.value > 0); 

  const finalPieData = pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1, color: '#475569' }];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Welcome to Ornot System Overview</p>
      </div>

      {/* --- TOP 4 WIDGET CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-800/60 shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-4 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            {successTx.length} Completed
          </p>
        </div>

        {/* Profit */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-800/60 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Net Profit</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">Rp {totalProfit.toLocaleString('id-ID')}</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Based on transaction margin</p>
        </div>

        {/* Users */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-800/60 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Registered Users</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalUsers}</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Platform members</p>
        </div>

        {/* Transactions */}
        <div className="bg-[#1e293b] rounded-xl p-5 border border-slate-800/60 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-white mt-1">{transactionsList.length}</h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold uppercase">{pendingTx.length} Pend</span>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-bold uppercase">{failedTx.length} Fail</span>
          </div>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-[#1e293b] rounded-xl border border-slate-800/60 shadow-lg p-5">
          <h3 className="text-base font-semibold text-white mb-4">Revenue Trend (Daily)</h3>
          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                Belum ada data transaksi sukses.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#818cf8' }}
                    formatter={(value: number | string | readonly (number | string)[] | undefined) => {
                      const numericValue = Array.isArray(value) ? value[0] : value ?? 0;
                      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(numericValue || 0));
                    }}
                  />
                  <Line type="monotone" dataKey="Revenue" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-800/60 shadow-lg p-5">
          <h3 className="text-base font-semibold text-white mb-4">Sales Report</h3>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">{transactionsList.length}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Orders</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {finalPieData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MIDDLE SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-[#1e293b] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center">
            <h3 className="text-base font-semibold text-white">Latest Transactions</h3>
            <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors border border-slate-700">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/30 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice Number</th>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactionsList.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No recent transactions.</td></tr>
                ) : (
                  transactionsList.slice(0, 5).map((tx) => {
                    const sellPrice = Number(tx.total_price || 0);
                    const paymentStatus = tx.payment_status?.toUpperCase() || 'UNPAID';
                    
                    const isPaid = paymentStatus === 'PAID' || paymentStatus === 'SUCCESS';
                    const isPending = paymentStatus === 'UNPAID' || paymentStatus === 'PENDING';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-indigo-400">{tx.invoice_number}</td>
                        <td className="px-6 py-4 text-slate-300">{tx.product_name}</td>
                        <td className="px-6 py-4 font-semibold text-slate-200">Rp {sellPrice.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isPaid 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : isPending 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {paymentStatus}
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

        {/* Side Column Widgets */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-[#1e293b] rounded-xl border border-slate-800/60 shadow-lg flex-1">
            <div className="px-5 py-4 border-b border-slate-700/50">
              <h3 className="text-base font-semibold text-white">System Configs</h3>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {settingsList.length === 0 ? (
                  <p className="text-slate-500 text-sm">No settings configured.</p>
                ) : (
                  settingsList.map((setting, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-slate-800/50 pb-3 last:border-0 last:pb-0">
                      <span className="text-sm text-slate-400 font-medium">{setting.key_name}</span>
                      <span className="text-sm font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{setting.value}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-10 text-center text-xs text-slate-500 pb-4 border-t border-slate-800/50 pt-6">
        © {new Date().getFullYear()} Ornot System. Crafted with Next.js & Tailwind.
      </footer>
    </>
  );
}