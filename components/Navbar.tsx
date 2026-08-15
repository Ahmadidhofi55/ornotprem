// components/Navbar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="w-full h-20 bg-white flex items-center justify-between overflow-visible shadow-sm border-b border-gray-100 relative z-50">
      
      {/* 1. BAGIAN KIRI: Logo Teks */}
      <div className="flex items-center pl-6 lg:pl-10 h-full">
        <Link href="/" className="font-extrabold text-2xl tracking-tighter text-gray-900 uppercase flex items-center">
          ORNOT<span className="text-indigo-600 ml-1">PREM</span>
        </Link>
      </div>

      {/* 2. BAGIAN TENGAH: Menu Navigasi Utama */}
      <nav className="hidden lg:flex flex-1 justify-center items-center space-x-6 px-4">
        <Link
          href="/"
          className={`text-sm tracking-wide ${pathname === '/' ? 'text-gray-900 font-extrabold' : 'text-gray-500 font-bold hover:text-gray-900 transition-colors'}`}
        >
          Home
        </Link>
        
        <Link
          href="/price-list"
          className={`text-sm tracking-wide ${pathname === '/price-list' ? 'text-gray-900 font-extrabold' : 'text-gray-500 font-bold hover:text-gray-900 transition-colors'}`}
        >
          Price List
        </Link>

        <Link 
          href="/cek-pesanan" 
          className={`text-sm tracking-wide ${pathname === '/cek-pesanan' ? 'text-gray-900 font-extrabold' : 'text-gray-500 font-bold hover:text-gray-900 transition-colors'}`}
        >
          Cek Pesanan
        </Link>

        <Link 
          href="/about" 
          className={`text-sm tracking-wide ${pathname === '/about' ? 'text-gray-900 font-extrabold' : 'text-gray-500 font-bold hover:text-gray-900 transition-colors'}`}
        >
          Tentang Kami
        </Link>
      </nav>

      <div 
        className="h-full bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-end px-6 lg:px-10 min-w-[150px] lg:min-w-[200px]"
        style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
      >
        {isHomePage ? (
          <Link 
            href="/login" 
            className="bg-white text-gray-900 font-extrabold text-sm px-7 py-2.5 rounded-full shadow hover:bg-gray-100 transition-colors"
          >
            Login
          </Link>
        ) : (
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm px-6 py-2.5 rounded-full transition-colors group"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>
        )}
      </div>

    </header>
  );
}