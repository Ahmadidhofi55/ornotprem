// app/invoice/[id]/layout.tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const invoiceId = decodeURIComponent(resolvedParams.id);

  return {
    title: `Payment Invoice ${invoiceId} | Ornot Prem`,
    description: `Complete your payment for invoice ${invoiceId}. Your order will be automatically processed immediately upon successful payment.`,
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