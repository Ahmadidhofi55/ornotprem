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

      // 1. Check if user exists in 'users' table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, whatsapp_number')
        .ilike('full_name', cleanName)
        .maybeSingle();

      if (userError) throw new Error('A database error occurred.');
      if (!userData) {
        throw new Error('Username / Full Name not found in database.');
      }

      // 2. Record reset request into 'password_resets' table
      await supabase.from('password_resets').insert([{
        user_id: userData.id,
        full_name: userData.full_name,
        email: userData.whatsapp_number || 'No WA Provided',
        status: 'PENDING'
      }]);

      setMessage('Password reset request has been successfully submitted to the Admin. Please contact Admin via WhatsApp to update your password.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'System error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-cyan-500/30">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-cyan-400 text-xs font-bold tracking-wider uppercase">
            Account Access Recovery
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Reset Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            Account Password
          </span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-400">
          Enter your Username to submit a password reset request.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-white/10 shadow-2xl">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm rounded-2xl font-medium flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm rounded-2xl font-medium space-y-3">
              <p className="leading-relaxed">{message}</p>
              <a 
                href={`https://wa.me/6285724486120?text=Halo%20Admin,%20saya%20lupa%20password%20untuk%20akun%20dengan%20nama:%20${encodeURIComponent(fullName)}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
              >
                <span>Confirm via Admin WhatsApp</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Username 
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter Full Name"
                  className="w-full pl-11 pr-4 py-3 bg-[#0f172a]/80 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-extrabold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting Request...</span>
                  </div>
                ) : (
                  'Send Request to Admin'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}