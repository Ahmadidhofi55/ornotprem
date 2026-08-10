// app/dashboard/topup/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

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
            clearInterval(interval);
            
            const session = JSON.parse(localStorage.getItem('user_session') || '{}');
            const depositAmount = Number(depositData.total_bayar);

            // 1. Ambil saldo user terbaru dari database
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
              return;
            }

            // 3. Update status deposit di tabel deposits menjadi SUCCESS
            await supabase
              .from('deposits')
              .update({ status: 'SUCCESS', updated_at: new Date() })
              .eq('invoice_number', depositData.invoice);

            setSuccessMessage(`Pembayaran berhasil! Saldo sebesar Rp ${depositAmount.toLocaleString('id-ID')} telah ditambahkan secara otomatis.`);
            setDepositData(null); 
            setAmount('');
            
            // 4. Update state user di frontend
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
  }, [depositData]);

  // 1. Buat Permintaan Deposit & Simpan ke Tabel deposits Sesuai Skema
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

      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      
      // DISESUAIKAN DENGAN SKEMA TABEL DEPOSITS ANDA
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

  // 2. Cek Status Manual (Opsional jika tombol manual diklik)
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

        const { data: currentUser } = await supabase
          .from('users')
          .select('balance')
          .eq('id', session.id)
          .single();

        const currentBalance = Number(currentUser?.balance || 0);
        const newBalance = currentBalance + depositAmount;

        await supabase
          .from('users')
          .update({ balance: newBalance, updated_at: new Date() })
          .eq('id', session.id);

        await supabase
          .from('deposits')
          .update({ status: 'SUCCESS', updated_at: new Date() })
          .eq('invoice_number', depositData.invoice);

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

      await supabase
        .from('deposits')
        .update({ status: 'CANCELED', updated_at: new Date() })
        .eq('invoice_number', depositData.invoice);

      setDepositData(null);
      setSuccessMessage('Permintaan deposit dibatalkan.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal membatalkan deposit.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Top Up Saldo</h1>
        <p className="text-sm text-slate-400 mt-1">Isi saldo akun Anda secara otomatis melalui QRIS.</p>
      </div>

      {successMessage && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">{successMessage}</div>}
      {errorMessage && <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">{errorMessage}</div>}

      {!depositData ? (
        <div className="space-y-6">
          <div className="bg-[#1e293b] rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl">
            <form onSubmit={handleCreateDeposit} className="space-y-6">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-sm text-slate-400">Saldo Saat Ini:</span>
                <span className="text-lg font-bold text-emerald-400">Rp {Number(user?.balance || 0).toLocaleString('id-ID')}</span>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Jumlah Deposit (Rp)</label>
                <input 
                  type="number" 
                  min="200" 
                  step="1" 
                  required 
                  placeholder="Contoh: 50000" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
                />
                <p className="text-[11px] text-slate-500 mt-1">Minimal deposit adalah Rp 200. Kode unik akan ditambahkan secara otomatis.</p>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all">
                {isLoading ? 'Membuat Tiket QRIS...' : 'Buat QRIS Deposit'}
              </button>
            </form>
          </div>

          <div className="bg-[#1e293b]/60 rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Cara Melakukan Deposit
            </h3>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>Masukkan jumlah nominal top up yang diinginkan (Minimal <span className="text-slate-200 font-semibold">Rp 200</span>).</li>
              <li>Klik tombol <span className="text-slate-200 font-semibold">Buat QRIS Deposit</span> untuk memunculkan kode QR.</li>
              <li>Scan kode QRIS menggunakan aplikasi e-wallet atau mobile banking apa saja (GoPay, OVO, DANA, BCA, Mandiri, dll).</li>
              <li>Transfer dengan nominal <span className="text-emerald-400 font-semibold">persis sama</span> hingga digit terakhir (termasuk kode unik).</li>
              <li>Saldo akan bertambah secara <span className="text-emerald-400 font-semibold">otomatis</span> begitu pembayaran terdeteksi sukses oleh sistem.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-[#1e293b] rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl text-center space-y-6">
          <div>
            <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">
              Menunggu Pembayaran (Auto-Check Aktif)
            </span>
            <h2 className="text-xl font-bold text-white mt-3">Scan QRIS untuk Membayar</h2>
          </div>

          <div className="bg-white p-4 rounded-2xl inline-block shadow-lg">
            {depositData.qr_image ? (
              <img src={depositData.qr_image} alt="QRIS Code" className="w-56 h-56 mx-auto object-contain" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-500 text-sm">Memuat QR Code...</div>
            )}
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 max-w-sm mx-auto">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Pembayaran</p>
            <p className="text-3xl font-black text-emerald-400">Rp {Number(depositData.total_bayar).toLocaleString('id-ID')}</p>
            <p className="text-[11px] text-amber-400 mt-2 italic">*Wajib bayar dengan nominal persis termasuk kode unik agar terproses otomatis.</p>
          </div>

          <div className="text-left text-xs text-slate-400 bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-2 max-w-md mx-auto">
            <p className="font-semibold text-slate-200 uppercase tracking-wider mb-2">Petunjuk Pembayaran:</p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>Buka aplikasi e-wallet atau mobile banking Anda.</li>
              <li>Pilih menu <b>Scan QR / QRIS</b>.</li>
              <li>Arahkan kamera ke kode QR di atas.</li>
              <li>Pastikan total nominal pembayaran sesuai yaitu <b>Rp {Number(depositData.total_bayar).toLocaleString('id-ID')}</b>.</li>
              <li>Selesaikan pembayaran. Saldo akan bertambah <b>secara otomatis</b> tanpa perlu klik tombol lagi.</li>
            </ol>
          </div>

          <div className="flex gap-3 max-w-sm mx-auto pt-2">
            <button 
              onClick={handleCheckStatus} 
              disabled={isCheckingStatus} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20"
            >
              {isCheckingStatus ? 'Memverifikasi...' : 'Cek Status Manual'}
            </button>
            <button 
              onClick={handleCancelDeposit} 
              className="px-4 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold py-3 rounded-xl text-sm transition-all border border-slate-700"
            >
              Batalkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}