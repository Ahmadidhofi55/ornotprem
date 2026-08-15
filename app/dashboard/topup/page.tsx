// app/dashboard/topup/page.tsx
"use client";

import { useEffect, useState, useRef } from 'react'; 
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

interface DepositData {
  invoice: string;
  amount_req: number;
  kode_unik: number;
  total_bayar: number;
  qr_image?: string;
  qr_raw?: string;
  expired_in?: string;
  status?: string;
}

export default function DepositPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [amount, setAmount] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [depositData, setDepositData] = useState<DepositData | null>(null);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Preset Nominal Cepat
  const presetAmounts = [20000, 50000, 100000, 250000];

  useEffect(() => {
    const initUser = async () => {
      const sessionStr = localStorage.getItem('user_session');
      if (!sessionStr) { router.push('/login'); return; }
      const session = JSON.parse(sessionStr);
      const { data } = await supabase.from('users').select('id, balance').eq('id', session.id).single();
      if (data) setUser(data);
    };
    initUser();
  }, [router]);

  // AUTO-CHECK STATUS PEMBAYARAN OTOMATIS TIAP 5 DETIK & UPDATE SALDO OTOMATIS
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (depositData && depositData.invoice) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/proxy-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              endpoint: 'pay_status', 
              bodyData: { invoice: depositData.invoice } 
            })
          });
          const json = await res.json();

          if (json.success && (json.data.status === 'success' || json.data.status === 'SUCCESS')) {
            clearInterval(interval); // Stop interval
            
            const session = JSON.parse(localStorage.getItem('user_session') || '{}');
            const depositAmount = Number(depositData.total_bayar);

            const { data: currentUser } = await supabase
              .from('users')
              .select('balance')
              .eq('id', session.id)
              .single();

            const currentBalance = Number(currentUser?.balance || 0);
            const newBalance = currentBalance + depositAmount;

            // 2. Perbarui saldo user di Supabase secara otomatis
            const { error: updateError } = await supabase
              .from('users')
              .update({ balance: newBalance, updated_at: new Date() })
              .eq('id', session.id);

            if (updateError) {
              console.error('Gagal memperbarui saldo otomatis:', updateError.message);
              return; // Jangan lanjutkan jika gagal update DB
            }

            // 3. Update status deposit di tabel deposits menjadi SUCCESS
            await supabase
              .from('deposits')
              .update({ status: 'SUCCESS', updated_at: new Date() })
              .eq('invoice_number', depositData.invoice);

            // ==============================================================
            // 4. 🔥 INTEGRASI META PIXEL UNTUK DEPOSIT BERHASIL 🔥
            // ==============================================================
            if (typeof window !== 'undefined' && window.fbq) {
              window.fbq('track', 'Purchase', {
                value: depositAmount,
                currency: 'IDR',
                content_name: 'Top Up Saldo - Ornot Prem',
                order_id: depositData.invoice
              });
              console.log("🔥 Meta Pixel 'Purchase' Fired untuk Top Up!");
            }
            // ==============================================================

            setSuccessMessage(`Pembayaran berhasil! Saldo sebesar Rp ${depositAmount.toLocaleString('id-ID')} telah ditambahkan secara otomatis.`);
            setDepositData(null); 
            setAmount('');
            
            // 5. Update state user di frontend
            setUser(prev => prev ? { ...prev, balance: newBalance } : null);
          }
        } catch (err) {
          console.error('Auto-check background error:', err);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [depositData]); // Bergantung pada depositData

  // 1. Buat Permintaan Deposit
  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); setSuccessMessage('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 200) {
      setErrorMessage('Minimal jumlah deposit adalah Rp 200');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/proxy-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          endpoint: 'pay', 
          bodyData: { amount: numericAmount } 
        })
      });
      const json = await res.json();

      if (!json.success) throw new Error(json.message || 'Gagal membuat tagihan deposit.');

      setDepositData(json.data);
      setSuccessMessage('QRIS deposit berhasil dibuat! Silakan scan kode di bawah.');

      // --- Meta Pixel: Track InitiateCheckout saat Generate QRIS ---
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          value: numericAmount,
          currency: 'IDR',
          content_name: 'Generate QRIS Top Up'
        });
      }
      // -------------------------------------------------------------

      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      
      const { error: insertError } = await supabase.from('deposits').insert([{
        user_id: session.id,
        invoice_number: json.data.invoice,
        amount: json.data.amount_req || numericAmount,
        unique_code: json.data.kode_unik || 0,
        total_transfer: json.data.total_bayar,
        payment_channel: 'QRIS',
        status: 'PENDING'
      }]);

      if (insertError) {
        console.error('Gagal insert ke tabel deposits:', insertError.message);
      }

    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Cek Status Manual (Fallback jika websocket lambat)
  const handleCheckStatus = async () => {
    if (!depositData) return;
    setIsCheckingStatus(true);
    setErrorMessage('');
    
    try {
      const res = await fetch('/api/proxy-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          endpoint: 'pay_status', 
          bodyData: { invoice: depositData.invoice } 
        })
      });
      const json = await res.json();

      if (!json.success) throw new Error(json.message || 'Gagal memeriksa status.');

      if (json.data.status === 'success' || json.data.status === 'SUCCESS') {
        const session = JSON.parse(localStorage.getItem('user_session') || '{}');
        const depositAmount = Number(depositData.total_bayar);

        const { data: currentUser } = await supabase.from('users').select('balance').eq('id', session.id).single();
        const currentBalance = Number(currentUser?.balance || 0);
        const newBalance = currentBalance + depositAmount;

        await supabase.from('users').update({ balance: newBalance, updated_at: new Date() }).eq('id', session.id);
        await supabase.from('deposits').update({ status: 'SUCCESS', updated_at: new Date() }).eq('invoice_number', depositData.invoice);

        // --- Meta Pixel: Track Purchase (Manual Cek) ---
        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'Purchase', {
            value: depositAmount,
            currency: 'IDR',
            content_name: 'Top Up Saldo - Ornot Prem (Manual Check)',
            order_id: depositData.invoice
          });
        }
        // -----------------------------------------------

        setSuccessMessage(`Pembayaran berhasil! Saldo sebesar Rp ${depositAmount.toLocaleString('id-ID')} telah ditambahkan.`);
        setDepositData(null); 
        setAmount('');
        setUser(prev => prev ? { ...prev, balance: newBalance } : null);
      } else {
        setErrorMessage(`Status pembayaran saat ini: ${json.data.status.toUpperCase()}`);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan saat memeriksa status pembayaran.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // 3. Batalkan Deposit
  const handleCancelDeposit = async () => {
    if (!depositData) return;
    try {
      await fetch('/api/proxy-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          endpoint: 'cancel_pay', 
          bodyData: { invoice: depositData.invoice } 
        })
      });

      await supabase.from('deposits').update({ status: 'CANCELED', updated_at: new Date() }).eq('invoice_number', depositData.invoice);

      setDepositData(null);
      setSuccessMessage('Permintaan deposit dibatalkan.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal membatalkan deposit.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER PAGE */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Top Up Saldo</h1>
          <p className="text-sm text-slate-400 mt-1">Isi saldo otomatis, instan masuk 24 jam nonstop.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Auto Verification
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
        {/* LEFT COLUMN: ACTION FORM OR QRIS */}
        {/* ======================================================== */}
        <div className="lg:col-span-7">
          {!depositData ? (
            <div className="bg-[#1e293b] rounded-[2rem] p-6 sm:p-8 border border-slate-700/50 shadow-2xl">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-700/50">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner border border-indigo-500/20">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Input Nominal</h2>
              </div>

              <form onSubmit={handleCreateDeposit} className="space-y-6">
                
                {/* Nominal Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Jumlah Deposit (Rp)</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-5 text-indigo-400 font-bold text-lg">Rp</div>
                    <input 
                      type="number" 
                      min="200" 
                      step="1" 
                      required 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl pl-14 pr-4 py-4 text-xl font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                {/* Quick Select Buttons */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Pilih Cepat</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {presetAmounts.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toString())}
                        className="bg-[#0f172a] border border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 text-slate-300 py-3 rounded-xl text-sm font-bold transition-all"
                      >
                        {val.toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isLoading || !amount} 
                    className={`w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all ${
                      isLoading || !amount
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]'
                    }`}
                  >
                    {isLoading ? 'MEMBUAT TIKET QRIS...' : 'BUAT QRIS DEPOSIT'}
                  </button>
                  <p className="text-center text-[11px] text-slate-500 mt-4 italic">*Kode unik akan ditambahkan otomatis untuk verifikasi instan.</p>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-[#1e293b] rounded-[2rem] p-6 sm:p-8 border border-slate-700/50 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider animate-pulse shadow-lg shadow-amber-500/10">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                Menunggu Pembayaran
              </div>
              
              <h2 className="text-2xl font-black text-white tracking-tight">Scan QRIS untuk Membayar</h2>

              <div className="bg-white p-5 rounded-3xl inline-block shadow-2xl shadow-white/5 border-4 border-slate-800">
                {depositData.qr_image ? (
                  <img src={depositData.qr_image} alt="QRIS Code" className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto" />
                ) : (
                  <div className="w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-xl border border-slate-200">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-2"></div>
                    <span className="text-sm font-semibold">Memuat QR...</span>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 rounded-2xl border border-slate-700/50 max-w-sm mx-auto shadow-inner">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1.5">Total Transfer</p>
                <p className="text-4xl font-black text-emerald-400 tracking-tight">Rp {Number(depositData.total_bayar).toLocaleString('id-ID')}</p>
                <p className="text-[11px] text-amber-400 mt-2.5 font-medium bg-amber-500/10 px-2 py-1 rounded-lg inline-block border border-amber-500/20">
                  ⚠️ Transfer persis hingga 3 digit terakhir.
                </p>
              </div>

              <div className="flex gap-3 max-w-sm mx-auto pt-4">
                <button 
                  onClick={handleCheckStatus} 
                  disabled={isCheckingStatus} 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 border border-emerald-500"
                >
                  {isCheckingStatus ? 'Mengecek...' : 'Cek Manual'}
                </button>
                <button 
                  onClick={handleCancelDeposit} 
                  className="px-5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 text-slate-400 font-bold py-3.5 rounded-xl text-sm transition-all border border-slate-700 active:scale-95"
                >
                  Batal
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: WALLET & INSTRUCTIONS */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6 lg:space-y-8 sticky top-24">
          
          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-900 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-indigo-900/30 text-white relative overflow-hidden border border-white/10 group">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-center mb-6">
              <div className="w-10 h-7 bg-white/20 rounded-md border border-white/30 flex flex-col justify-center gap-1 p-1">
                <div className="w-full h-px bg-white/20"></div>
              </div>
              <span className="text-[10px] font-bold tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">SALDO AKTIF</span>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight drop-shadow-lg flex items-center gap-2">
                <span className="text-lg text-indigo-200 font-bold">Rp</span>
                {Number(user?.balance || 0).toLocaleString('id-ID')}
              </h2>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-[#1e293b]/70 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-slate-700/50 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              Cara Top Up Otomatis
            </h3>
            
            <ol className="relative border-l border-slate-700 ml-3 space-y-6">                  
              <li className="pl-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-slate-800 rounded-full -left-3 ring-4 ring-[#0f172a] text-[10px] font-bold text-slate-300 border border-slate-600">1</span>
                <h3 className="font-bold text-slate-200 text-sm mb-1">Pilih Nominal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Pilih atau ketik nominal deposit. Klik tombol Buat QRIS.</p>
              </li>
              <li className="pl-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-slate-800 rounded-full -left-3 ring-4 ring-[#0f172a] text-[10px] font-bold text-slate-300 border border-slate-600">2</span>
                <h3 className="font-bold text-slate-200 text-sm mb-1">Scan & Transfer</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Buka M-Banking/E-Wallet Anda, pilih menu Scan QRIS.</p>
              </li>
              <li className="pl-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-500 rounded-full -left-3 ring-4 ring-[#0f172a] text-[10px] font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] border border-indigo-400">3</span>
                <h3 className="font-bold text-indigo-300 text-sm mb-1">Transfer Persis!</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Pastikan nominal transfer <strong className="text-emerald-400">SAMA PERSIS</strong> hingga 3 digit kode unik di belakang agar diverifikasi otomatis oleh mesin.</p>
              </li>
            </ol>
          </div>

        </div>

      </div>
    </div>
  );
}