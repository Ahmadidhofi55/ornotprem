// app/admin/transactions/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface TransactionItem {
  id: string;
  invoice_number: string;
  product_name: string;
  customer_wa: string;
  base_price: number;
  margin: number;
  total_price: number;
  payment_status: string;
  delivery_status: string;
  created_at: string;
}

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
};

export default function TransactionsCRUDPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal View State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  // Modal Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null);
  const [formPaymentStatus, setFormPaymentStatus] = useState('');
  const [formDeliveryStatus, setFormDeliveryStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<{ id: string, invoice: string } | null>(null);

  // FUNGSI TARIK DATA
  const fetchTransactions = async () => {
    try {
      setErrorMessage('');
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTransactions(data);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('Error fetching transactions:', message);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadTransactions = async () => {
      try {
        setErrorMessage('');
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isActive && data) setTransactions(data);
      } catch (err: unknown) {
        if (!isActive) return;
        const message = getErrorMessage(err);
        console.error('Error fetching transactions:', message);
        setErrorMessage(message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadTransactions();

    return () => {
      isActive = false;
    };
  }, []);

  // --- ACTIONS: VIEW ---
  const openViewModal = (tx: TransactionItem) => {
    setSelectedTx(tx);
    setIsViewModalOpen(true);
  };

  // --- ACTIONS: EDIT ---
  const openEditModal = (tx: TransactionItem) => {
    setEditingTx(tx);
    setFormPaymentStatus(tx.payment_status || 'UNPAID');
    setFormDeliveryStatus(tx.delivery_status || 'PENDING');
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          payment_status: formPaymentStatus,
          delivery_status: formDeliveryStatus,
          updated_at: new Date()
        })
        .eq('id', editingTx.id)
        .select(); // Memastikan pengecekan jika RLS memblokir update

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Gagal mengupdate data. Pastikan RLS tabel 'transactions' sudah dimatikan.");
      }

      setIsEditModalOpen(false);
      setEditingTx(null);
      fetchTransactions();
    } catch (err: unknown) {
      alert('Gagal menyimpan: ' + getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  // --- ACTIONS: DELETE ---
  const openDeleteModal = (id: string, invoice: string) => {
    setTxToDelete({ id, invoice });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!txToDelete) return;

    setIsDeleteModalOpen(false);
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', txToDelete.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Gagal dihapus oleh database. Pastikan RLS tabel 'transactions' sudah dimatikan.");
      }

      fetchTransactions();
    } catch (err: unknown) {
      alert('Sistem Error: ' + getErrorMessage(err));
      setIsLoading(false);
    } finally {
      setTxToDelete(null);
    }
  };

  return (
    <>
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Order Transactions
          </h1>
          <p className="text-sm text-slate-400 mt-1">Monitor histori pesanan produk premium pengguna.</p>
        </div>
        <button 
          onClick={() => { setIsLoading(true); fetchTransactions(); }} 
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Data
        </button>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          <strong>Gagal memuat data:</strong> {errorMessage}.
        </div>
      )}

      {/* TABLE CONTENT */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/40 text-slate-400 border-b border-slate-700/50 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Customer WA</th>
                  <th className="px-6 py-4">Laba (Margin)</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Delivery</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {transactions.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Belum ada transaksi tercatat.</td></tr>
                ) : (
                  transactions.map((tx) => {
                    const isPaid = tx.payment_status === 'PAID' || tx.payment_status === 'SUCCESS';
                    const isDelivered = tx.delivery_status === 'SUCCESS';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-indigo-400">{tx.invoice_number}</td>
                        <td className="px-6 py-4 font-medium text-slate-200">{tx.product_name}</td>
                        <td className="px-6 py-4 text-slate-400">{tx.customer_wa}</td>
                        <td className="px-6 py-4 font-bold text-emerald-400">+Rp {Number(tx.margin || 0).toLocaleString('id-ID')}</td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {tx.payment_status}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            isDelivered ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-700'
                          }`}>
                            {tx.delivery_status}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* BTN VIEW */}
                            <button onClick={() => openViewModal(tx)} className="p-2 bg-slate-700/50 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors" title="Lihat Detail">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            {/* BTN EDIT */}
                            <button onClick={() => openEditModal(tx)} className="p-2 bg-slate-700/50 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors" title="Edit Status">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            {/* BTN DELETE */}
                            <button onClick={() => openDeleteModal(tx.id, tx.invoice_number)} className="p-2 bg-slate-700/50 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors" title="Hapus Transaksi">
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
      {isViewModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Detail Transaksi</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Invoice Number</span>
                <span className="font-bold text-indigo-400 font-mono">{selectedTx.invoice_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Produk</span>
                <span className="font-semibold text-white">{selectedTx.product_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">WhatsApp Pelanggan</span>
                <span className="text-slate-200">{selectedTx.customer_wa}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Harga Modal Dasar</span>
                <span className="text-slate-200">Rp {Number(selectedTx.base_price).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Keuntungan (Margin)</span>
                <span className="font-bold text-emerald-400">+Rp {Number(selectedTx.margin).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Total Harga Jual</span>
                <span className="font-bold text-white text-base">Rp {Number(selectedTx.total_price).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Status Pembayaran</span>
                <span className="font-bold text-amber-400">{selectedTx.payment_status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Status Pengiriman</span>
                <span className="font-bold text-blue-400">{selectedTx.delivery_status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tanggal Dibuat</span>
                <span className="text-slate-200">{new Date(selectedTx.created_at).toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-900/30 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-slate-700 hover:bg-slate-600 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* MODAL 2: EDIT STATUS */}
      {/* ------------------------------------- */}
      {isEditModalOpen && editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Update Status Transaksi</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-1">Invoice</p>
                <p className="text-sm font-mono text-indigo-400 font-bold">{editingTx.invoice_number}</p>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Status</label>
                <select 
                  value={formPaymentStatus} 
                  onChange={(e) => setFormPaymentStatus(e.target.value)} 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Status</label>
                <select 
                  value={formDeliveryStatus} 
                  onChange={(e) => setFormDeliveryStatus(e.target.value)} 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESS">PROCESS</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all">
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* MODAL 3: DELETE CONFIRMATION */}
      {/* ------------------------------------- */}
      {isDeleteModalOpen && txToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center transform scale-100 transition-transform">
            
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Hapus Transaksi?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Hapus Invoice <strong className="text-white">{txToDelete.invoice}</strong> dari database? Data yang dihapus tidak bisa dikembalikan.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all border border-rose-600"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}