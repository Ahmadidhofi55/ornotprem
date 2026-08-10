// app/cek-pesanan/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cek Status Pesanan & Akun Premium | Ornot Prem',
  description: 'Lacak riwayat transaksi, cek status pembayaran, dan dapatkan detail kredensial (email & password) akun premium Anda secara otomatis di sini.',
  keywords: ['cek pesanan ornot prem', 'lacak pesanan akun premium', 'status pembayaran', 'detail akun premium'],
  openGraph: {
    title: 'Cek Status Pesanan - Ornot Prem',
    description: 'Lacak transaksi dan ambil detail akun premium Anda dengan mudah menggunakan nomor invoice.',
    url: 'https://ornotprem.my.id/cek-pesanan',
    siteName: 'Ornot Prem',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function CekPesananLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}