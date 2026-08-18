// app/admin/roas/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RoasCalculatorPage() {
  const [adSpend, setAdSpend] = useState<number | ''>('');
  const [totalSales, setTotalSales] = useState<number | ''>('');
  
  // State untuk margin yang ditarik dari database
  const [minMargin, setMinMargin] = useState<number | ''>(''); 
  const [maxMargin, setMaxMargin] = useState<number | ''>('');
  
  const [isLoading, setIsLoading] = useState(true);

  // Mengambil nilai min_margin dan max_margin dari tabel settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('key_name, value')
        .in('key_name', ['min_margin', 'max_margin']);

      if (!error && data) {
        data.forEach((setting) => {
          if (setting.key_name === 'min_margin') {
            setMinMargin(Number(setting.value) || 0);
          }
          if (setting.key_name === 'max_margin') {
            setMaxMargin(Number(setting.value) || 0);
          }
        });
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  // --- LOGIKA PERHITUNGAN (STANDAR ADVERTISER) ---
  const spend = Number(adSpend) || 0;
  const sales = Number(totalSales) || 0;
  const minM = Number(minMargin) || 0;
  const maxM = Number(maxMargin) || 0;

  // 1. CPA (Cost per Acquisition / Cost per Purchase)
  const cpa = sales > 0 ? spend / sales : 0;

  // 2. Keuntungan Kotor (Gross Margin) = Penjualan x Margin per item
  const minGrossProfit = sales * minM;
  const maxGrossProfit = sales * maxM;

  // 3. Laba Bersih (Net Profit) = Keuntungan Kotor - Biaya Iklan
  const minNetProfit = minGrossProfit - spend;
  const maxNetProfit = maxGrossProfit - spend;

  // 4. ROAS (Return on Ad Spend) = Keuntungan Kotor / Biaya Iklan (Ditampilkan sebagai multiplier, misal 2x)
  const minRoas = spend > 0 ? minGrossProfit / spend : 0;
  const maxRoas = spend > 0 ? maxGrossProfit / spend : 0;

  // 5. ROI (Return on Investment) = (Laba Bersih / Biaya Iklan) * 100%
  const minRoi = spend > 0 ? (minNetProfit / spend) * 100 : 0;
  const maxRoi = spend > 0 ? (maxNetProfit / spend) * 100 : 0;

  // --- LOGIKA STATUS IKLAN ---
  let statusInfo = { text: "Masukkan Data Iklan", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" };
  if (spend > 0 && sales > 0) {
    if (minNetProfit > 0) {
      statusInfo = { text: "UNTUNG BESAR (PROFIT) 🚀", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    } else if (maxNetProfit >= 0 && minNetProfit <= 0) {
      statusInfo = { text: "RAWAN BEP / BALIK MODAL ⚖️", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    } else {
      statusInfo = { text: "BONCOS (RUGI) 😭", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            Kalkulator ROAS & ROI
          </h1>
          <p className="text-sm text-slate-400 mt-2">Hitung performa iklan Meta Ads berdasarkan data <code className="text-indigo-400">min_margin</code> & <code className="text-indigo-400">max_margin</code> dari sistem.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* --- KOLOM INPUT FORM --- */}
          <div className="lg:col-span-5 bg-[#1e293b] rounded-[2rem] p-6 sm:p-8 border border-slate-700/50 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 border-b border-slate-700/50 pb-4">Data Iklan Hari Ini</h2>
            
            <div className="space-y-5">
              {/* Input Biaya Iklan */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Biaya Iklan (Ad Spend)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">Rp</div>
                  <input 
                    type="number" 
                    value={adSpend} 
                    onChange={(e) => setAdSpend(e.target.value === '' ? '' : Number(e.target.value))} 
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                    placeholder="Contoh: 50000"
                  />
                </div>
              </div>

              {/* Input Jumlah Penjualan */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Jumlah Pesanan (Closing)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <input 
                    type="number" 
                    value={totalSales} 
                    onChange={(e) => setTotalSales(e.target.value === '' ? '' : Number(e.target.value))} 
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                    placeholder="Contoh: 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Input Min Margin */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Min Margin (DB)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</div>
                    <input 
                      type="number" 
                      value={minMargin} 
                      onChange={(e) => setMinMargin(e.target.value === '' ? '' : Number(e.target.value))} 
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-3 py-3 text-slate-300 text-sm font-semibold focus:outline-none focus:border-slate-500 transition-all" 
                    />
                  </div>
                </div>

                {/* Input Max Margin */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Max Margin (DB)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</div>
                    <input 
                      type="number" 
                      value={maxMargin} 
                      onChange={(e) => setMaxMargin(e.target.value === '' ? '' : Number(e.target.value))} 
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-3 py-3 text-slate-300 text-sm font-semibold focus:outline-none focus:border-slate-500 transition-all" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => { setAdSpend(''); setTotalSales(''); }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold border border-slate-700 transition-colors"
                >
                  Reset Form Iklan
                </button>
              </div>
            </div>
          </div>

          {/* --- KOLOM HASIL & ANALISA --- */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Status Alert */}
            <div className={`p-4 rounded-2xl border flex items-center justify-center gap-3 transition-colors duration-500 shadow-lg ${statusInfo.bg} ${statusInfo.border} ${statusInfo.color}`}>
              <span className="text-lg font-black tracking-widest uppercase">{statusInfo.text}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Kartu: CPA */}
              <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/50 shadow-lg">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">CPA (Biaya per Closing)</p>
                <h3 className="text-3xl font-black text-white">Rp {cpa.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</h3>
                <p className="text-xs text-slate-500 mt-2">
                  Batas Aman CPA: Harus <strong className="text-rose-400">di bawah Rp {minM.toLocaleString('id-ID')}</strong> agar tidak boncos.
                </p>
              </div>

              {/* Kartu: ROAS Bersih */}
              <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/50 shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl"></div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">Margin ROAS</p>
                <h3 className="text-3xl font-black text-indigo-400">
                  {minRoas.toFixed(1)}x <span className="text-sm font-medium text-slate-500 mx-1">-</span> {maxRoas.toFixed(1)}x
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  <strong className="text-indigo-300">ROAS {'>'} 1.0x</strong> artinya margin lebih besar dari uang yang dibakar (Profit).
                </p>
              </div>

            </div>

            {/* Kartu: Laba Bersih (Net Profit) & ROI */}
            <div className="bg-gradient-to-br from-slate-900 to-[#1e293b] rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
              
              <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Estimasi Laba Bersih & ROI
              </h3>
              
              <div className="grid grid-cols-2 gap-4 divide-x divide-slate-700/50">
                
                {/* Skenario Terburuk (Min) */}
                <div className="pr-4">
                  <p className="text-[10px] text-rose-300/80 font-bold uppercase tracking-widest mb-2 bg-rose-500/10 inline-block px-2 py-1 rounded border border-rose-500/20">Skenario Min Margin</p>
                  <p className={`text-2xl sm:text-3xl font-black tracking-tight ${minNetProfit < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {minNetProfit < 0 ? '-' : ''}Rp {Math.abs(minNetProfit).toLocaleString('id-ID')}
                  </p>
                  <p className={`text-xs font-bold mt-1 ${minRoi < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    ROI: {minRoi > 0 ? '+' : ''}{minRoi.toFixed(0)}%
                  </p>
                  <div className="mt-4 text-xs text-slate-400 space-y-1.5 border-t border-slate-700/50 pt-3">
                    <p className="flex justify-between"><span>Gross Profit:</span> <span className="text-slate-300">Rp {minGrossProfit.toLocaleString('id-ID')}</span></p>
                    <p className="flex justify-between"><span>Ad Spend:</span> <span className="text-rose-400/80">-Rp {spend.toLocaleString('id-ID')}</span></p>
                  </div>
                </div>

                {/* Skenario Terbaik (Max) */}
                <div className="pl-4 sm:pl-6">
                  <p className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-widest mb-2 bg-emerald-500/10 inline-block px-2 py-1 rounded border border-emerald-500/20">Skenario Max Margin</p>
                  <p className={`text-2xl sm:text-3xl font-black tracking-tight ${maxNetProfit < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {maxNetProfit < 0 ? '-' : ''}Rp {Math.abs(maxNetProfit).toLocaleString('id-ID')}
                  </p>
                  <p className={`text-xs font-bold mt-1 ${maxRoi < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    ROI: {maxRoi > 0 ? '+' : ''}{maxRoi.toFixed(0)}%
                  </p>
                  <div className="mt-4 text-xs text-slate-400 space-y-1.5 border-t border-slate-700/50 pt-3">
                    <p className="flex justify-between"><span>Gross Profit:</span> <span className="text-slate-300">Rp {maxGrossProfit.toLocaleString('id-ID')}</span></p>
                    <p className="flex justify-between"><span>Ad Spend:</span> <span className="text-rose-400/80">-Rp {spend.toLocaleString('id-ID')}</span></p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}