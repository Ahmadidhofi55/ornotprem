// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10 mt-auto text-gray-400 font-sans z-20">
      
      {/* Efek pendar cahaya tipis di bawah */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-t from-cyan-600/10 to-transparent blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Kiri: Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-white font-extrabold tracking-tight text-lg">
                ORNOT<span className="text-cyan-400">PREM</span>.
              </span>
            </div>
            <p className="text-gray-500 text-xs text-center md:text-left font-medium">
              &copy; {new Date().getFullYear()} ORNOT PREM (Ornot Group). All Right Reserved.
            </p>
          </div>
          
          {/* Kanan: Tautan Footer bergaya Navbar Pill */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-sm font-medium">
            <Link 
              href="/blog" 
              className="px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition-all duration-300"
            >
              Blog
            </Link>
            <Link 
              href="/syarat-ketentuan" 
              className="px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition-all duration-300"
            >
              Syarat & Ketentuan
            </Link>
            <Link 
              href="/kebijakan-privasi" 
              className="px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition-all duration-300"
            >
              Kebijakan Privasi
            </Link>
            <Link 
              href="/kontak" 
              className="px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-gray-300 hover:text-cyan-400 transition-all duration-300"
            >
              Hubungi Kami
            </Link>
          </div>
          
        </div>
      </div>
    </footer>
  );
}