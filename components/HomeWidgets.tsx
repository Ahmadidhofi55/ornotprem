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

  return (
    <section className="mt-8 mb-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
      
      {/* 1. Widget Cari Aplikasi (Otomatis) */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-300 ml-1">Cari Aplikasi</label>
        <div className="relative group">
          {/* Ikon Kaca Pembesar */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik Netflix, Canva..." 
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all shadow-lg placeholder:text-gray-500"
          />
          {/* Indikator Loading Tipis saat mengetik (opsional) */}
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
               </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Widget Lacak Pesanan */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-300 ml-1">Lacak Pesanan Anda</label>
        <form onSubmit={handleTrack} className="relative group">
          {/* Ikon Paket/Box */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <input 
            type="text" 
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            placeholder="No. Invoice (INV-...)" 
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-2xl pl-11 pr-12 py-3.5 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all shadow-lg placeholder:text-gray-500"
          />
          <button 
            type="submit" 
            className="absolute inset-y-1.5 right-1.5 w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-colors shadow-md disabled:opacity-50"
            disabled={!invoice.trim()}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>

    </section>
  );
}