// app/admin/deposits/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface DepositItem {
  id: string;
  user_id: string;
  invoice_number: string;
  amount: number;
  unique_code: number;
  total_transfer: number;
  payment_channel: string;
  status: string;
  created_at: string;
  updated_at: string;
  users?: { full_name: string };
}

export default function DepositsCRUDPage() {
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal View State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositItem | null>(null);

  // Modal Edit Status State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [depositToEdit, setDepositToEdit] = useState<DepositItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<{ id: string, invoice: string } | null>(null);

  const fetchDeposits = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('deposits').select('*, users(full_name)').order('created_at', { ascending: false });
    if (!error && data) setDeposits(data);
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const loadDeposits = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('deposits')
        .select('*, users(full_name)')
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (!error && data) setDeposits(data);
      setIsLoading(false);
    };

    void loadDeposits();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- ACTIONS: VIEW ---
  const openViewModal = (deposit: DepositItem) => {
    setSelectedDeposit(deposit);
    setIsViewModalOpen(true);
  };

  // --- ACTIONS: EDIT STATUS ---
  const openEditModal = (deposit: DepositItem) => {
    setDepositToEdit(deposit);
    setNewStatus(deposit.status);
    setIsEditModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositToEdit) return;

    setIsUpdating(true);
    try {
      // 1. Update status di tabel deposits
      const { error: depositError } = await supabase
        .from('deposits')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', depositToEdit.id);

      if (depositError) throw depositError;

      // 2. Jika diubah menjadi SUCCESS dan sebelumnya BUKAN SUCCESS, tambahkan saldo
      if (newStatus === 'SUCCESS' && depositToEdit.status !== 'SUCCESS' && depositToEdit.user_id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('balance')
          .eq('id', depositToEdit.user_id)
          .single();

        if (userError) throw userError;

        const currentBalance = Number(userData.balance || 0);
        const depositAmount = Number(depositToEdit.total_transfer || 0);
        const updatedBalance = currentBalance + depositAmount;

        const { error: balanceError } = await supabase
          .from('users')
          .update({ balance: updatedBalance, updated_at: new Date() })
          .eq('id', depositToEdit.user_id);

        if (balanceError) throw balanceError;
        alert(`Status diubah menjadi SUCCESS. Saldo Rp ${depositAmount.toLocaleString('id-ID')} telah ditambahkan ke user.`);
      } else if (depositToEdit.status !== newStatus) {
        alert(`Status berhasil diperbarui menjadi ${newStatus}.`);
      }

      setIsEditModalOpen(false);
      setDepositToEdit(null);
      fetchDeposits();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Gagal memproses deposit:", error);
      alert("Terjadi kesalahan: " + message);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- ACTIONS: DELETE ---
  const openDeleteModal = (id: string, invoice: string) => {
    setDepositToDelete({ id, invoice });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (depositToDelete) {
      await supabase.from('deposits').delete().eq('id', depositToDelete.id);
      setIsDeleteModalOpen(false);
      setDepositToDelete(null);
      fetchDeposits();
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Deposit Transactions</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor and manage user balance top-ups.</p>
        </div>
        <button onClick={fetchDeposits} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold border border-slate-700 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-slate-800/60 shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/30 text-slate-400 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Total Transfer</th>
                  <th className="px-6 py-4 font-medium">Channel</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {deposits.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No deposits found.</td></tr>
                ) : (
                  deposits.map((dep) => {
                    const isSuccess = dep.status === 'SUCCESS';
                    const isPending = dep.status === 'PENDING';

                    return (
                      <tr key={dep.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-indigo-400">{dep.invoice_number}</td>
                        <td className="px-6 py-4 text-slate-300">{dep.users?.full_name || 'Unknown'}</td>
                        <td className="px-6 py-4 font-bold text-emerald-400">Rp {Number(dep.total_transfer || 0).toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 text-slate-400">{dep.payment_channel}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {dep.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* BTN VIEW */}
                            <button onClick={() => openViewModal(dep)} className="p-2 bg-slate-700/50 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors" title="View Details">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            {/* BTN EDIT STATUS */}
                            <button onClick={() => openEditModal(dep)} className="p-2 bg-slate-700/50 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors" title="Edit Status">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            {/* BTN DELETE */}
                            <button onClick={() => openDeleteModal(dep.id, dep.invoice_number)} className="p-2 bg-slate-700/50 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors" title="Delete Record">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {/* ------------------------------------- */}
      {/* MODAL 1: VIEW DETAILS */}
      {/* ------------------------------------- */}
      {isViewModalOpen && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Deposit Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Invoice Number</span>
                <span className="font-bold text-indigo-400 font-mono">{selectedDeposit.invoice_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Customer Name</span>
                <span className="font-semibold text-white">{selectedDeposit.users?.full_name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Request Amount</span>
                <span className="text-slate-200">Rp {Number(selectedDeposit.amount).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Unique Code</span>
                <span className="text-amber-400">+{selectedDeposit.unique_code}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Transfer</span>
                <span className="font-bold text-emerald-400 text-base">Rp {Number(selectedDeposit.total_transfer).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Payment Channel</span>
                <span className="text-slate-200">{selectedDeposit.payment_channel}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-white">{selectedDeposit.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Created At</span>
                <span className="text-slate-200">{new Date(selectedDeposit.created_at).toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-900/30 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-slate-700 hover:bg-slate-600 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* MODAL 2: EDIT STATUS */}
      {/* ------------------------------------- */}
      {isEditModalOpen && depositToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Edit Status</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="p-6">
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-1">Invoice</p>
                <p className="text-sm font-mono text-indigo-400 font-bold">{depositToEdit.invoice_number}</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Status</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                  <option value="CANCELED">CANCELED</option>
                </select>
                {newStatus === 'SUCCESS' && depositToEdit.status !== 'SUCCESS' && (
                  <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                    *Changing to SUCCESS will automatically add Rp {Number(depositToEdit.total_transfer).toLocaleString('id-ID')} to the user&apos;s balance.
                  </p>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition-all">
                  {isUpdating ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* MODAL 3: DELETE CONFIRMATION */}
      {/* ------------------------------------- */}
      {isDeleteModalOpen && depositToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center transform scale-100 transition-transform">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Deposit?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Delete Invoice <strong className="text-white">{depositToDelete.invoice}</strong> permanently from the database?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all border border-rose-600">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}