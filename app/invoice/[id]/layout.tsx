// app/invoice/[id]/layout.tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const invoiceId = decodeURIComponent(resolvedParams.id);

  return {
    title: `Tagihan Pembayaran ${invoiceId} | Ornot Prem`,
    description: `Selesaikan pembayaran untuk invoice ${invoiceId} Anda. Sistem akan memproses pesanan secara otomatis segera setelah pembayaran berhasil.`,
    robots: {
      index: false, 
      follow: false,
    }
  };
}

export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}