// app/api/check-payment/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PremkuProduct {
  id: number | string;
  name: string;
}

export async function POST(req: Request) {
  try {
    const { invoiceNumber } = await req.json();
    if (!invoiceNumber) {
      return NextResponse.json({ error: 'Invoice tidak valid' }, { status: 400 });
    }

    // 1. Ambil data transaksi dari Supabase
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .single();

    if (txError || !tx) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Jika sudah PAID, langsung return sukses tanpa cek ulang ke Premku
    if (tx.payment_status === 'PAID') {
      return NextResponse.json({ success: true, status: 'PAID' });
    }

    // Parse log untuk mendapatkan invoice deposit premku
    let premkuDepositInvoice = '';
    if (tx.api_response_log) {
      try {
        const parsedLog = JSON.parse(tx.api_response_log);
        premkuDepositInvoice = parsedLog.premku_deposit_invoice;
      } catch (e) {
        console.error("Gagal parse log", e);
      }
    }

    if (!premkuDepositInvoice) {
      return NextResponse.json({ success: true, status: tx.payment_status });
    }

    // 2. Cek status pembayaran ke API Premku (pay_status)
    const checkRes = await fetch('https://premku.com/api/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.PREMKU_API_KEY as string,
        invoice: premkuDepositInvoice
      }),
      cache: 'no-store'
    });

    const checkData = await checkRes.json();

    // Perhatikan status dari API Premku (biasanya 'success' atau 'paid' tergantung respon callback/status)
    // Jika pembayaran terdeteksi sukses/lunas di Premku:
    const isPaidInPremku = checkData.success && (checkData.data?.status === 'success' || checkData.data?.status === 'paid' || checkData.status === 'success');

    if (isPaidInPremku) {
      // 3. Lakukan Order otomatis ke API Premku menggunakan saldo yang baru masuk
      const orderRefId = `ORD-${tx.invoice_number}`;
      const orderRes = await fetch('https://premku.com/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.PREMKU_API_KEY as string,
          product_id: Number(tx.api_product_id),
          qty: 1,
          ref_id: orderRefId
        }),
        cache: 'no-store'
      });

      const orderData = await orderRes.json();
      let accountDetails = 'Akun sedang diproses otomatis ke WhatsApp Anda.';

      if (orderData.success) {
        // Cek status detail akun atau ambil dari respons order/status endpoint jika ada
        accountDetails = `Berhasil! Invoice Pusat: ${orderData.invoice}. Akun dikirim ke WA ${tx.customer_wa}`;
      }

      // 4. Update Status Transaksi di Supabase menjadi PAID
      await supabase
        .from('transactions')
        .update({
          payment_status: 'PAID',
          delivery_status: orderData.success ? 'SUCCESS' : 'PROCESSING',
          digital_account_details: accountDetails
        })
        .eq('invoice_number', invoiceNumber);

      return NextResponse.json({ success: true, status: 'PAID' });
    }

    return NextResponse.json({ success: true, status: tx.payment_status });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}