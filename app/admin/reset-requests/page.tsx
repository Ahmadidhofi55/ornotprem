// app/admin/reset-requests/page.tsx
"use client";

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ResetRequestItem {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
}

export default function ResetRequestsPage() {
  const [requests, setRequests] = useState<ResetRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('password_resets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setRequests(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('password_resets')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      fetchRequests();
    } else {
      alert('Gagal memperbarui status: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus riwayat permintaan ini?')) return;
    const { error } = await supabase
      .from('password_resets')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchRequests();
    } else {
      alert('Gagal menghapus: ' + error.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Password Reset Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">List of password reset requests from users.</p>
        </div>
        <button 
          onClick={fetchRequests} 
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Data
        </button>
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/40 text-slate-400 border-b border-slate-700/50 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-4 sm:px-6 py-4">Request Time</th>
                  <th className="px-4 sm:px-6 py-4">Username </th>
                  <th className="px-4 sm:px-6 py-4">WhatsApp </th>
                  <th className="px-4 sm:px-6 py-4">Status</th>
                  <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {requests.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 sm:px-6 py-12 text-center text-slate-500">No password reset requests available.</td></tr>
                ) : (
                  requests.map((item) => {
                    const dateStr = new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                    const isPending = item.status === 'PENDING';

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 sm:px-6 py-4 text-slate-400 text-xs">{dateStr}</td>
                        <td className="px-4 sm:px-6 py-4 font-bold text-white">{item.full_name}</td>
                        <td className="px-4 sm:px-6 py-4 text-slate-300">{item.email}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {isPending ? (
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'COMPLETED')} 
                                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-xs font-bold transition-colors"
                              >
                                Mark as Completed
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'PENDING')} 
                                className="px-3 py-1.5 bg-slate-700/50 text-slate-400 hover:bg-slate-700 rounded-lg text-xs font-semibold transition-colors"
                              >
                                Mark as Pending
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20" 
                              title="Delete History"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
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