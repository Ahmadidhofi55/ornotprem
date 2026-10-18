// app/admin/transactions/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface TransactionItem {
  id: string;
  user_id: string | null;
  invoice_number: string;
  api_product_id: string;
  product_name: string;
  customer_wa: string;
  customer_email: string | null;
  base_price: number;
  margin: number;
  total_price: number;
  payment_channel: string | null;
  payment_status: string;
  delivery_status: string;
  digital_account_details: string | null;
  api_response_log: string | null;
  created_at: string;
  updated_at?: string;
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
  
  // State Form Edit Lengkap
  const [formData, setFormData] = useState({
    user_id: '',
    invoice_number: '',
    api_product_id: '',
    product_name: '',
    customer_wa: '',
    customer_email: '',
    base_price: 0,
    margin: 0,
    total_price: 0,
    payment_channel: '',
    payment_status: 'UNPAID',
    delivery_status: 'PENDING',
    digital_account_details: '',
    api_response_log: ''
  });
  
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
    setFormData({
      user_id: tx.user_id || '',
      invoice_number: tx.invoice_number || '',
      api_product_id: tx.api_product_id || '',
      product_name: tx.product_name || '',
      customer_wa: tx.customer_wa || '',
      customer_email: tx.customer_email || '',
      base_price: Number(tx.base_price) || 0,
      margin: Number(tx.margin) || 0,
      total_price: Number(tx.total_price) || 0,
      payment_channel: tx.payment_channel || '',
      payment_status: tx.payment_status || 'UNPAID',
      delivery_status: tx.delivery_status || 'PENDING',
      digital_account_details: tx.digital_account_details || '',
      api_response_log: tx.api_response_log || ''
    });
    setIsEditModalOpen(true);
  };

  // Handler Perubahan Input Form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Otomatis hitung total_price jika base_price atau margin diubah
      if (name === 'base_price' || name === 'margin') {
        const bp = name === 'base_price' ? Number(value) || 0 : Number(prev.base_price) || 0;
        const mg = name === 'margin' ? Number(value) || 0 : Number(prev.margin) || 0;
        updated.total_price = bp + mg;
      }

      return updated;
    });
  };

  // Handler Simpan Seluruh Perubahan Data
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    setIsUpdating(true);
    try {
      const payload = {
        user_id: formData.user_id.trim() ? formData.user_id.trim() : null,
        invoice_number: formData.invoice_number.trim(),
        api_product_id: formData.api_product_id.trim(),
        product_name: formData.product_name.trim(),
        customer_wa: formData.customer_wa.trim(),
        customer_email: formData.customer_email.trim() ? formData.customer_email.trim() : null,
        base_price: Number(formData.base_price),
        margin: Number(formData.margin),
        total_price: Number(formData.total_price),
        payment_channel: formData.payment_channel.trim() ? formData.payment_channel.trim() : null,
        payment_status: formData.payment_status,
        delivery_status: formData.delivery_status,
        digital_account_details: formData.digital_account_details.trim() ? formData.digital_account_details.trim() : null,
        api_response_log: formData.api_response_log.trim() ? formData.api_response_log.trim() : null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', editingTx.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Gagal mengupdate data. Pastikan RLS / Policy tabel 'transactions' mengizinkan Update.");
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
        throw new Error("Gagal dihapus oleh database. Pastikan RLS / Policy tabel 'transactions' mengizinkan Delete.");
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Order Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Kelola dan update seluruh detail transaksi produk digital.</p>
        </div>
        <button 
          onClick={() => { setIsLoading(true); fetchTransactions(); }} 
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
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
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/40 text-slate-400 border-b border-slate-700/50 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-4 sm:px-6 py-4">Invoice</th>
                  <th className="px-4 sm:px-6 py-4">Produk</th>
                  <th className="px-4 sm:px-6 py-4">Customer WA</th>
                  <th className="px-4 sm:px-6 py-4">Total Price</th>
                  <th className="px-4 sm:px-6 py-4">Margin</th>
                  <th className="px-4 sm:px-6 py-4">Payment</th>
                  <th className="px-4 sm:px-6 py-4">Delivery</th>
                  <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 sm:px-6 py-12 text-center text-slate-500">
                      Belum ada transaksi tercatat.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isPaid = tx.payment_status === 'PAID' || tx.payment_status === 'SUCCESS';
                    const isDelivered = tx.delivery_status === 'SUCCESS';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 sm:px-6 py-4 font-mono font-bold text-indigo-400">
                          {tx.invoice_number}
                        </td>
                        <td className="px-4 sm:px-6 py-4 font-medium text-slate-200">
                          {tx.product_name}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-slate-400">
                          {tx.customer_wa}
                        </td>
                        <td className="px-4 sm:px-6 py-4 font-bold text-white">
                          Rp {Number(tx.total_price || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 sm:px-6 py-4 font-bold text-emerald-400">
                          +Rp {Number(tx.margin || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            {tx.payment_status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${isDelivered ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-700'}`}>
                            {tx.delivery_status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openViewModal(tx)} 
                              className="p-2 bg-slate-700/50 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors" 
                              title="Lihat Detail"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => openEditModal(tx)} 
                              className="p-2 bg-slate-700/50 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors" 
                              title="Edit Data Transaksi"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => openDeleteModal(tx.id, tx.invoice_number)} 
                              className="p-2 bg-slate-700/50 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors" 
                              title="Hapus Transaksi"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
      {/* MODAL 1: VIEW DETAILS                 */}
      {/* ------------------------------------- */}
      {isViewModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-white">Full Transaction Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Transaction ID (UUID)</span>
                  <span className="font-mono text-slate-300 text-xs">{selectedTx.id}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">User ID (UUID)</span>
                  <span className="font-mono text-slate-300 text-xs">{selectedTx.user_id || 'Guest / Null'}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Invoice Number</span>
                  <span className="font-mono font-bold text-indigo-400">{selectedTx.invoice_number}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">API Product ID</span>
                  <span className="font-mono text-slate-200">{selectedTx.api_product_id}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Product Name</span>
                  <span className="font-semibold text-white">{selectedTx.product_name}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Customer WhatsApp</span>
                  <span className="text-slate-200 font-medium">{selectedTx.customer_wa}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Customer Email</span>
                  <span className="text-slate-200">{selectedTx.customer_email || '-'}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Payment Channel</span>
                  <span className="text-slate-200">{selectedTx.payment_channel || 'QRIS'}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Base Cost Price</span>
                  <span className="text-slate-200">Rp {Number(selectedTx.base_price).toLocaleString('id-ID')}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Profit (Margin)</span>
                  <span className="font-bold text-emerald-400">+Rp {Number(selectedTx.margin).toLocaleString('id-ID')}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Total Selling Price</span>
                  <span className="font-bold text-white text-base">Rp {Number(selectedTx.total_price).toLocaleString('id-ID')}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Payment Status</span>
                  <span className="font-bold text-amber-400">{selectedTx.payment_status}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Delivery Status</span>
                  <span className="font-bold text-blue-400">{selectedTx.delivery_status}</span>
                </div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400 block mb-0.5">Created Date</span>
                  <span className="text-slate-200">{new Date(selectedTx.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Detail Akun Digital */}
              <div className="pt-2">
                <span className="text-xs text-slate-400 block mb-1">Digital Account Details</span>
                <pre className="p-3 bg-[#0f172a] rounded-xl text-xs text-emerald-300 font-mono whitespace-pre-wrap overflow-x-auto border border-slate-800">
                  {selectedTx.digital_account_details || 'Tidak ada data akun'}
                </pre>
              </div>

              {/* API Response Log */}
              <div className="pt-2">
                <span className="text-xs text-slate-400 block mb-1">API Response Log</span>
                <pre className="p-3 bg-[#0f172a] rounded-xl text-xs text-slate-400 font-mono whitespace-pre-wrap overflow-x-auto border border-slate-800 max-h-36">
                  {selectedTx.api_response_log || 'Tidak ada log API'}
                </pre>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-800 flex justify-end shrink-0">
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* MODAL 2: EDIT ALL TRANSACTION FIELDS  */}
      {/* ------------------------------------- */}
      {isEditModalOpen && editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit All Transaction Data
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Invoice Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice Number</label>
                  <input 
                    type="text" 
                    name="invoice_number"
                    value={formData.invoice_number} 
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* API Product ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">API Product ID</label>
                  <input 
                    type="text" 
                    name="api_product_id"
                    value={formData.api_product_id} 
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Name</label>
                  <input 
                    type="text" 
                    name="product_name"
                    value={formData.product_name} 
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Customer WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer WhatsApp</label>
                  <input 
                    type="text" 
                    name="customer_wa"
                    value={formData.customer_wa} 
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Customer Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Email (Optional)</label>
                  <input 
                    type="email" 
                    name="customer_email"
                    value={formData.customer_email} 
                    onChange={handleInputChange}
                    placeholder="Contoh: user@email.com"
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* User ID (UUID) */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">User ID / UUID (Optional)</label>
                  <input 
                    type="text" 
                    name="user_id"
                    value={formData.user_id} 
                    onChange={handleInputChange}
                    placeholder="Kosongkan jika Guest Checkout"
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Base Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Base Cost Price (Rp)</label>
                  <input 
                    type="number" 
                    name="base_price"
                    value={formData.base_price} 
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Margin / Profit */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Margin / Profit (Rp)</label>
                  <input 
                    type="number" 
                    name="margin"
                    value={formData.margin} 
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-emerald-400 font-bold text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Total Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Selling Price (Rp)</label>
                  <input 
                    type="number" 
                    name="total_price"
                    value={formData.total_price} 
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-white font-extrabold text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Payment Channel */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Channel</label>
                  <input 
                    type="text" 
                    name="payment_channel"
                    value={formData.payment_channel} 
                    onChange={handleInputChange}
                    placeholder="QRIS / BALANCE"
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Status</label>
                  <select 
                    name="payment_status"
                    value={formData.payment_status} 
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none font-bold text-amber-400"
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILED">FAILED</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>

                {/* Delivery Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery Status</label>
                  <select 
                    name="delivery_status"
                    value={formData.delivery_status} 
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none font-bold text-blue-400"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESS">PROCESS</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>

              </div>

              {/* Digital Account Details */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Digital Account Details (Credentials / Data Akun)
                </label>
                <textarea 
                  name="digital_account_details"
                  value={formData.digital_account_details} 
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Format teks akun atau JSON string..."
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-xs text-emerald-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* API Response Log */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  API Response Log (JSON String dari Supplier / QRIS)
                </label>
                <textarea 
                  name="api_response_log"
                  value={formData.api_response_log} 
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Raw JSON string response dari API Premku..."
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating} 
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all"
                >
                  {isUpdating ? 'Saving All Changes...' : 'Save All Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* MODAL 3: DELETE CONFIRMATION          */}
      {/* ------------------------------------- */}
      {isDeleteModalOpen && txToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center transform scale-100 transition-transform">
            
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Delete Transaction?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Hapus invoice <strong className="text-white">{txToDelete.invoice}</strong> dari database? Data yang dihapus tidak dapat dikembalikan.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all border border-rose-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}