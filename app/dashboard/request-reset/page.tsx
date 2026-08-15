// app/dashboard/request-reset/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RequestResetPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Memastikan user sudah login
  useEffect(() => {
    const sessionStr = localStorage.getItem('user_session');
    if (!sessionStr) { 
      router.push('/login'); 
    }
  }, [router]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username) {
      setErrorMessage('Username wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Ambil session user saat ini
      const sessionStr = localStorage.getItem('user_session');
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      
      const userId = session?.id || null;

      if (!userId) throw new Error('Sesi tidak valid, silakan login ulang.');

      // 2. Tarik data whatsapp_number dari tabel 'users' secara otomatis
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('whatsapp_number') 
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        throw new Error('Gagal memverifikasi data akun Anda.');
      }

      // 3. Menyimpan request ke dalam tabel 'password_resets'
      const { error } = await supabase
        .from('password_resets')
        .insert([{
          user_id: userId,
          full_name: username,
          // Mengisi kolom 'email' (di tabel password_resets) dengan data 'whatsapp_number' dari tabel users
          email: userData.whatsapp_number || 'Tidak ada nomor HP', 
          status: 'PENDING'
        }]);

      if (error) throw new Error(error.message);

      setSuccessMessage('Permintaan Reset Password berhasil dikirim. Admin akan segera memproses permintaan Anda.');
      setUsername('');
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message || 'Gagal mengirim permintaan.');
      } else {
        setErrorMessage('Terjadi kesalahan pada sistem.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER PAGE */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Request Reset Password</h1>
          <p className="text-sm text-slate-400 mt-1">Demi keamanan, perubahan password harus melalui persetujuan Admin.</p>
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

      {/* MAIN FORM */}
      <div className="bg-[#1e293b] rounded-[2rem] p-6 sm:p-8 border border-slate-700/50 shadow-2xl">
        
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-700/50">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner border border-amber-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Form Pengajuan</h2>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-6 max-w-lg">
          
          {/* Input Username (Disimpan sebagai full_name) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Username Terdaftar</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                placeholder="Masukkan username Anda..."
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">*Sistem akan otomatis mencocokkan nomor WhatsApp yang terhubung dengan akun ini.</p>
          </div>

          <div className="pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row gap-4">
            <button 
              type="submit" 
              disabled={isLoading || !username} 
              className={`flex-1 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all ${
                isLoading || !username
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/25 active:scale-[0.98]'
              }`}
            >
              {isLoading ? 'MENGIRIM TIKET...' : 'AJUKAN RESET PASSWORD'}
            </button>
            
            {/* Tombol Alternatif Langsung ke WA Admin */}
            <a 
              href="https://wa.me/6285724486120?text=Halo%20Admin%20Ornot%20Prem,%20saya%20ingin%20mengajukan%20reset%20password%20akun%20saya."
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat Admin Langsung
            </a>
          </div>

        </form>
      </div>

    </div>
  );
}