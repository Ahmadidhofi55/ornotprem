import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayoutWrapper from './ClientLayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ornot Prem - Platform Jual Beli Akun Premium Otomatis',
  description: 'Platform jual beli akun premium otomatis, aman, instan, dan terpercaya. Beli Netflix, Spotify, Canva, dan aplikasi premium lainnya dengan harga termurah.',
  keywords: ['akun premium', 'jual beli akun', 'netflix premium', 'spotify premium', 'canva pro', 'ornot prem', 'akun premium murah', 'ornotprem'],
  authors: [{ name: 'Ornot Prem' }],
  metadataBase: new URL('https://ornotprem.my.id'),
  openGraph: {
    title: 'Ornot Prem - Platform Jual Beli Akun Premium Otomatis',
    description: 'Beli Netflix, Spotify, Canva, dan aplikasi premium lainnya dengan harga termurah secara otomatis.',
    url: 'https://ornotprem.my.id',
    siteName: 'Ornot Prem',
    locale: 'id_ID',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ornot Prem - Platform Jual Beli Akun Premium',
    description: 'Platform jual beli akun premium otomatis, aman, instan, dan terpercaya.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#0a0a0a]`}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}