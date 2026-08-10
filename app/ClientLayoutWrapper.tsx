// app/ClientLayoutWrapper.tsx
"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();


  const hideNavbarFooter = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register');

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideNavbarFooter && <Footer />}
    </>
  );
}