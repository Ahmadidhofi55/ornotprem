// app/register/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!whatsappNumber.startsWith('08') && !whatsappNumber.startsWith('628')) {
      setErrorMsg('WhatsApp number must start with 08 or 628.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanName = fullName.trim();
      const cleanWa = whatsappNumber.trim();

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .ilike('full_name', cleanName)
        .maybeSingle();

      if (existingUser) {
        throw new Error('This Full Name / Username is already registered.');
      }

      // Insert into public.users
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: crypto.randomUUID(),
            full_name: cleanName,
            whatsapp_number: cleanWa,
            password: password,
            balance: 0,
            role: 'users',
          }
        ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push('/login');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to create a new account. Please try again.');
      }
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
            Create New Account
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Join Us Today at <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            Ornot Prem
          </span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-400">
          Fill in your details below to get started.
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

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Username / Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Username / Full Name
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

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                WhatsApp Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.47-5.112-3.756-6.58-6.58l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="081234567890"
                  className="w-full pl-11 pr-4 py-3 bg-[#0f172a]/80 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-[#0f172a]/80 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.036 12c1.274-4.057 5.065-7 9.542-7 4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
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
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Register Now'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs sm:text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline">
                Sign In Here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}