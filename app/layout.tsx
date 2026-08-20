// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script'; 
import './globals.css';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import { Analytics } from '@vercel/analytics/react';

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
  verification: {
    google: 'rvsqGn89cEtnpFhYgTt8OtU7EaRgQ3lq1X1TV6yhaL8',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* --- 2. META PIXEL BASE CODE --- */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2015745659070544');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#0a0a0a]`}>
        
        {/* --- 3. META PIXEL NOSCRIPT FALLBACK --- */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2015745659070544&ev=PageView&noscript=1"
            alt="Meta Pixel"
          />
        </noscript>

        <ClientLayoutWrapper>
          {children}
          <Analytics />
        </ClientLayoutWrapper>
        
      </body>
    </html>
  );
}