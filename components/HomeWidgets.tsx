// components/HomeWidgets.tsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

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

  return (
    <section className="mt-4 mb-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 px-4">
      
      {/* 1. Lacak Pesanan (Atas di HP, Kiri di PC) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-200/40 hover:shadow-purple-500/10 transition-all duration-300 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs sm:text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            Lacak Pesanan Anda
          </label>
          <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            Real-time Status
          </span>
        </div>

        <form onSubmit={handleTrack} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>

          <input 
            type="text" 
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            placeholder="No. Invoice (INV-...)" 
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm font-medium rounded-xl pl-9 pr-16 py-2.5 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-600/10 transition-all shadow-inner placeholder:text-gray-400 font-mono"
          />

          <button 
            type="submit" 
            disabled={!invoice.trim()}
            className="absolute inset-y-1 right-1 px-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-95 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Cek</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>

      {/* 2. Cari Produk (Bawah di HP, Kanan di PC) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-md shadow-gray-200/40 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs sm:text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Cari Produk Premium
          </label>
          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            Pencarian Otomatis
          </span>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Netflix, Canva, Spotify..." 
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 transition-all shadow-inner placeholder:text-gray-400"
          />

          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

    </section>
  );
}