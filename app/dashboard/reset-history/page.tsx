// app/dashboard/reset-history/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ResetRequestItem {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
}

export default function UserResetHistoryPage() {
  const [requests, setRequests] = useState<ResetRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const sessionStr = localStorage.getItem('user_session');
        if (!sessionStr) return;
        const session = JSON.parse(sessionStr);

        const { data, error } = await supabase
          .from('password_resets')
          .select('*')
          .eq('user_id', session.id)
          .order('created_at', { ascending: false });

        if (!error && data) setRequests(data);
      } catch (err) {
        console.error('Gagal memuat riwayat:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRequests();
  }, []);

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Riwayat Reset Password</h1>
        <p className="text-sm text-slate-400 mt-1">Pantau status permintaan pemulihan akun Anda ke Admin.</p>
      </div>

      <div className="bg-[#1e293b] rounded-[2rem] border border-slate-700/50 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/30 text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4">Waktu Request</th>
                  <th className="px-6 py-4">Kontak / WhatsApp</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                      Belum ada riwayat permintaan reset password.
                    </td>
                  </tr>
                ) : (
                  requests.map((item) => {
                    const dateStr = new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                    const isPending = item.status === 'PENDING';

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-slate-300 text-xs">{dateStr}</td>
                        <td className="px-6 py-4 font-semibold text-slate-200">{item.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}