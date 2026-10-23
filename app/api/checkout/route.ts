// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      productId, 
      productName, 
      customerWa, 
      customerEmail, 
      paymentChannel, 
      price 
    } = body;

    if (!productId || !customerWa) {
      return NextResponse.json(
          { success: false, error: 'ID Produk dan Nomor WhatsApp wajib diisi.' },
          { status: 400 }
      );
    }

    const invoiceNumber = `INV-GUEST-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let qrData = null;
    const basePrice = Number(price) || 0;
    const margin = 0;
    let totalBayar = basePrice + margin;
    let rawPayLog = null;

    // 1. Request QRIS ke API Premku (/api/pay)
    if (paymentChannel === 'QRIS' && totalBayar > 0) {
      const payRes = await fetch('https://premku.com/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.PREMKU_API_KEY || '',
          amount: totalBayar
        })
      });

      const payResult = await payRes.json();
      rawPayLog = JSON.stringify(payResult);

      if (payResult.success && payResult.data) {
        qrData = payResult.data.qr_image || payResult.data.qr_raw;
        totalBayar = payResult.data.total_bayar || totalBayar;
      }
    }

    // 2. Simpan QRIS ke kolom api_response_log agar halaman Invoice bisa membacanya dari Supabase
    const { error: dbError } = await supabase.from('transactions').insert([{
      user_id: null,
      invoice_number: invoiceNumber,
      api_product_id: String(productId),
      product_name: productName || 'Produk Digital',
      customer_wa: customerWa,
      customer_email: customerEmail || null,
      base_price: basePrice,
      margin: margin,
      total_price: totalBayar,
      payment_channel: paymentChannel || 'QRIS',
      payment_status: 'PENDING',
      delivery_status: 'PENDING',
      api_response_log: rawPayLog // <-- Menyimpan log response API Premku yang berisi QRIS
    }]);

    if (dbError) {
      throw new Error(`Failed to save transaction: ${dbError.message}`);
    }

    return NextResponse.json({
      success: true,
      invoice: invoiceNumber,
      message: 'Checkout successful.',
      totalBayar,
      qrData
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}