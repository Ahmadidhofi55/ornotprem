// components/HomeWidgets.tsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const POPULAR_SEARCHES = ['Netflix', 'Canva', 'Viu', 'Spotify', 'YouTube'];

export default function HomeWidgets() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State untuk input
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [invoice, setInvoice] = useState('');

  // Efek pencarian otomatis (Debounce 400ms)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      
      if (searchQuery.trim()) {
        current.set('q', searchQuery.trim());
      } else {
        current.delete('q');
      }
      
      const search = current.toString();
      const query = search ? `?${search}` : '';
      
      // scroll: false agar halaman tidak melompat ke atas saat mengetik
      router.push(`/${query}`, { scroll: false });
    }, 400); 

    return () => clearTimeout(timeout);
  }, [searchQuery, router, searchParams]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoice.trim()) {
      router.push(`/cek-pesanan?invoice=${invoice.trim()}`);
    }
  };

  const handleChipClick = (tag: string) => {
    setSearchQuery(tag);
  };

  return (
    <section className="mt-6 mb-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
      
      {/* 1. Widget Cari Aplikasi (Otomatis) */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              Cari Produk Premium
            </label>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Pencarian Otomatis
            </span>
          </div>

          <div className="relative group">
            {/* Ikon Kaca Pembesar */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Netflix, Canva, YouTube..." 
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-2xl pl-11 pr-10 py-3.5 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all shadow-inner placeholder:text-gray-400"
            />

            {/* Indikator Pulsa Aktif saat sedang ada input */}
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Chips untuk meningkatkan conversion rate */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-gray-400 mr-1">🔥 Populer:</span>
          {POPULAR_SEARCHES.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleChipClick(tag)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 ${
                searchQuery.toLowerCase() === tag.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Widget Lacak Pesanan */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-purple-500/10 transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Lacak Pesanan Anda
            </label>
            <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              Real-time Status
            </span>
          </div>

          <form onSubmit={handleTrack} className="relative group">
            {/* Ikon Paket */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            <input 
              type="text" 
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              placeholder="Masukkan No. Invoice (INV-...)" 
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-2xl pl-11 pr-14 py-3.5 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 transition-all shadow-inner placeholder:text-gray-400"
            />

            {/* Tombol Lacak bergradasi miring seperti Navbar */}
            <button 
              type="submit" 
              disabled={!invoice.trim()}
              className="absolute inset-y-1.5 right-1.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Cek</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>

        {/* Info mikro kepercayaan pembeli */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-medium">
          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Akses garansi & detail akun langsung di halaman invoice.</span>
        </div>
      </div>

    </section>
  );
}