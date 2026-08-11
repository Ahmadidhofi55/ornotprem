// app/admin/layout.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State untuk memastikan kode hanya berjalan di sisi browser (klien), mencegah error Hydration.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ambil sesi secara langsung tanpa useEffect tambahan (Derived State)
  let session = null;
  if (isMounted) {
    try {
      const sessionStr = localStorage.getItem('user_session');
      if (sessionStr) {
        session = JSON.parse(sessionStr);
      }
    } catch {
      session = null;
    }
  }

  const adminName = session?.full_name || 'Admin';
  const isAuthorized = session?.role === 'admin';

  useEffect(() => {
    // Jika komponen sudah dimuat dan user tidak punya akses, redirect ke login
    if (isMounted && !isAuthorized) {
      router.push('/login');
    }
  }, [isMounted, isAuthorized, router]);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Transactions', path: '/admin/transactions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Deposits', path: '/admin/deposits', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Reset Requests', path: '/admin/reset-requests', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
    { name: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  // Selama web belum siap di browser atau sesi tidak punya akses, tampilkan loading layar penuh
  if (!isMounted || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f172a]">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans flex overflow-hidden selection:bg-indigo-500/30 relative">
      
      {/* OVERLAY UNTUK MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1e293b] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="h-16 flex items-center px-6 border-b border-slate-800/50 bg-[#1e293b] flex-shrink-0">
            
            {/* TULISAN ORNOT PREM (DUA WARNA) */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-wide">
                <span className="text-white">Ornot</span>
                <span className="text-indigo-400 ml-1">Prem</span>
              </span>
            </div>
            
            {/* Tombol Tutup Sidebar untuk Mobile */}
            <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="px-4 py-6">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Main Menu</p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link 
                    key={item.name} 
                    href={item.path} 
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive 
                        ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} /></svg>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f172a] relative">
        
        {/* TOPBAR */}
        <header className="h-16 bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0">
          <div className="flex items-center">
            {/* Tombol Hamburger untuk memanggil menu di HP */}
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-300 hover:text-white mr-4 p-1">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-l border-slate-700 pl-4 ml-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">{adminName}</p>
                <p className="text-[11px] text-indigo-400 font-medium">Administrator</p>
              </div>
              <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 border border-slate-700 transition-colors" title="Logout">
                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT RENDERED HERE */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </div>

      </main>
    </div>
  );
}