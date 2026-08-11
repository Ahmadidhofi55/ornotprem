// app/forgot-password/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ForgotPasswordPage() {
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    setIsLoading(true);

    try {
      const cleanName = fullName.trim();

      // 1. Cek apakah username / full_name ada di tabel users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, whatsapp_number')
        .ilike('full_name', cleanName)
        .maybeSingle();

      if (userError) throw new Error('Kesalahan database.');
      if (!userData) {
        throw new Error('Username / Full Name tidak ditemukan di database.');
      }

      // 2. Catat permintaan reset ke tabel 'password_resets' agar Admin bisa lihat
      await supabase.from('password_resets').insert([{
        user_id: userData.id,
        full_name: userData.full_name,
        email: userData.whatsapp_number || 'Tidak ada WA', // Menggunakan kolom email untuk menyimpan info kontak
        status: 'PENDING'
      }]);

      setMessage('Permintaan reset password berhasil dikirim ke Admin. Silakan hubungi Admin via WhatsApp untuk memperbarui sandi Anda.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-black text-white tracking-tight">Reset Password</h2>
        <p className="mt-2 text-center text-sm text-slate-400">Masukkan Username Anda untuk meminta pemulihan akses.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#1e293b] py-8 px-6 shadow-2xl rounded-3xl border border-slate-700 sm:px-10">
          
          {errorMsg && <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl font-medium">{errorMsg}</div>}
          {message && (
            <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl font-medium space-y-3">
              <p>{message}</p>
              <a 
                href={`https://wa.me/6285724486120?text=Halo%20Admin,%20saya%20lupa%20password%20untuk%20akun%20dengan%20nama:%20${encodeURIComponent(fullName)}`} 
                target="_blank" 
                rel="noreferrer"
                className="block text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-md"
              >
                Konfirmasi ke WhatsApp Admin ↗
              </a>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Username / Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan Nama Lengkap"
                className="block w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Kirim Permintaan ke Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">
              ← Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}