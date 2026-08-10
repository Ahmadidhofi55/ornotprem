// app/admin/settings/page.tsx
"use client";

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface SettingItem {
  id: number;
  key_name: string;
  value: string;
  updated_at: string;
}

export default function SettingsCRUDPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modal State Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Modal State Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Form State
  const [formId, setFormId] = useState<number | null>(null);
  const [formKeyName, setFormKeyName] = useState('');
  const [formValue, setFormValue] = useState('');

  // FUNGSI TARIK DATA (DENGAN PENANGANAN ERROR)
  const fetchSettings = useCallback(async () => {
    try {
      setErrorMessage('');
      const { data, error } = await supabase.from('settings').select('*').order('id', { ascending: true });

      if (error) throw error;
      if (data) setSettings(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Gagal mengambil data settings:', message);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        setErrorMessage('');
        const { data, error } = await supabase.from('settings').select('*').order('id', { ascending: true });

        if (error) throw error;

        if (isMounted && data) {
          setSettings(data);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Gagal mengambil data settings:', message);

        if (isMounted) {
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormId(null);
    setFormKeyName('');
    setFormValue('');
    setIsModalOpen(true);
  };

  const openEditModal = (setting: SettingItem) => {
    setIsEditing(true);
    setFormId(setting.id);
    setFormKeyName(setting.key_name);
    setFormValue(setting.value);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setIsLoading(true);

    try {
      if (isEditing && formId) {
        const { error } = await supabase.from('settings').update({ key_name: formKeyName, value: formValue, updated_at: new Date() }).eq('id', formId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('settings').insert([{ key_name: formKeyName, value: formValue }]);
        if (error) throw error;
      }
      fetchSettings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert('Gagal menyimpan: ' + message);
      setIsLoading(false);
    }
  };

  // Fungsi untuk membuka modal delete
  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Fungsi eksekusi delete dari dalam modal
  const handleDelete = async () => {
    if (itemToDelete === null) return;
    
    setIsDeleteModalOpen(false);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.from('settings').delete().eq('id', itemToDelete);
      if (error) throw error;
      fetchSettings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert('Gagal menghapus: ' + message);
      setIsLoading(false);
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            System Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">Kelola konfigurasi global seperti API Key dan Margin.</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Tambah Setting
        </button>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          <strong>Gagal memuat data:</strong> {errorMessage}. (Pastikan RLS Supabase dimatikan).
        </div>
      )}

      {/* LIST CONTENT */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 bg-[#1e293b] rounded-2xl border border-slate-800">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : settings.length === 0 ? (
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white">Belum Ada Pengaturan</h3>
            <p className="text-slate-400 text-sm mt-1 mb-6">Anda belum menambahkan key konfigurasi apa pun.</p>
            <button onClick={openAddModal} className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              + Buat Pengaturan Baru
            </button>
          </div>
        ) : (
          settings.map((setting) => (
            <div key={setting.id} className="bg-[#1e293b] rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-700 transition-colors">
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-bold text-slate-200">{setting.key_name}</h3>
                  <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                    ID: {setting.id}
                  </span>
                </div>
                
                <div className="bg-[#0f172a] rounded-lg p-3 border border-slate-700/50">
                  <p className="text-sm font-mono text-emerald-400 break-all">
                    {setting.value}
                  </p>
                </div>
                
                <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Diperbarui: {new Date(setting.updated_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              <div className="flex md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-5">
                <button 
                  onClick={() => openEditModal(setting)} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-slate-700"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Edit
                </button>
                <button 
                  onClick={() => confirmDelete(setting.id)} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-rose-400 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-slate-700"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Hapus
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* MODAL FORM (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{isEditing ? 'Edit Konfigurasi' : 'Tambah Konfigurasi'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Name (Unik)</label>
                <input 
                  type="text" 
                  required
                  value={formKeyName}
                  onChange={(e) => setFormKeyName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="Cth: premku_api_key"
                />
              </div>
              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Value / Isi</label>
                <textarea 
                  required
                  rows={3}
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                  placeholder="Masukkan nilai di sini..."
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Buat Setting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRM DELETE */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center transform scale-100 transition-transform">
            
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Hapus Pengaturan?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Tindakan ini tidak dapat dibatalkan. Pengaturan ini akan dihapus secara permanen dari sistem database Anda.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all border border-rose-600"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}