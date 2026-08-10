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

      // 1. Cari email berdasarkan full_name di tabel profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .ilike('full_name', cleanName)
        .maybeSingle();

      if (profileError || !profileData || !profileData.email) {
        throw new Error('Full Name tidak ditemukan di database.');
      }

      // 2. Kirim email pemulihan sandi (Supabase Auth mengirim link reset)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(profileData.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setMessage('Instruksi pemulihan password berhasil dikirim. Silakan cek email/kontak terkait.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Terjadi kesalahan saat memproses permintaan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Masukkan Username akun Anda untuk memulihkan akses.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100 sm:px-10">
          
          {errorMsg && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {message && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl font-medium">
              {message}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-sm font-bold text-gray-700">Username</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan Username Anda"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-md text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Memproses...' : 'Kirim Instruksi Reset'}
              </button>
            </div>
          </form>

          {/* Kembali ke Login */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link href="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 underline">
              ← Kembali ke halaman Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}