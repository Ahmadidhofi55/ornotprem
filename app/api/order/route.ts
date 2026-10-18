// app/api/order/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, qty, refId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID (productId) wajib diisi.' },
        { status: 400 }
      );
    }

    const formattedRefId = refId || `TRX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Susun payload resmi sesuai Dokumentasi API Premku v3.8 (/api/order)
    const payloadToPremku = {
      api_key: process.env.PREMKU_API_KEY || '',
      product_id: parseInt(productId, 10),
      qty: parseInt(qty || 1, 10),
      ref_id: String(formattedRefId),
    };

    // Tembak API Order Premku
    const res = await fetch('https://premku.com/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadToPremku),
    });

    const data = await res.json();

    // Penanganan Error jika status HTTP error atau success = false
    if (!res.ok || data.success === false) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.message || 'Gagal memproses pesanan ke server Premku.' 
        },
        { status: res.status >= 400 ? res.status : 400 }
      );
    }

    // Kembalikan response sukses beserta invoice & array akun (data.accounts)
    return NextResponse.json({
      success: true,
      invoice: data.data?.invoice || data.invoice,
      message: data.message,
      data: data.data,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}