// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-white border-t border-gray-100 mt-auto text-gray-600 font-sans z-20 overflow-hidden">
      
      {/* Aksen pita gradasi Indigo-Purple di bagian paling atas footer biar serasi dengan sisi kanan Navbar */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 to-purple-700 w-full" />

      {/* Efek pendar latar belakang halus */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-t from-indigo-500/5 via-purple-500/5 to-transparent blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Kiri: Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
              </span>
              <span className="text-gray-900 font-extrabold tracking-tight text-lg uppercase">
                ORNOT<span className="text-indigo-600 ml-1">PREM</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs text-center md:text-left font-medium">
              &copy; {new Date().getFullYear()} ORNOT PREM (Ornot Group). All Rights Reserved.
            </p>
          </div>
          
          {/* Kanan: Tautan Navigasi Footer */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-sm font-bold">
            <Link 
              href="/blog" 
              className="px-4 py-2 rounded-full bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-gray-500 hover:text-indigo-600 transition-all duration-300"
            >
              Blog
            </Link>
            <Link 
              href="/syarat-ketentuan" 
              className="px-4 py-2 rounded-full bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-gray-500 hover:text-indigo-600 transition-all duration-300"
            >
              Syarat & Ketentuan
            </Link>
            <Link 
              href="/kebijakan-privasi" 
              className="px-4 py-2 rounded-full bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-gray-500 hover:text-indigo-600 transition-all duration-300"
            >
              Kebijakan Privasi
            </Link>
            <Link 
              href="/kontak" 
              className="px-4 py-2 rounded-full bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-gray-500 hover:text-indigo-600 transition-all duration-300"
            >
              Hubungi Kami
            </Link>
          </div>
          
        </div>
      </div>
    </footer>
  );
}