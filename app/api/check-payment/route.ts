// app/api/check-payment/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractPremkuDepositId, checkDepositStatus, createProductOrder } from '../../lib/premku';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { invoiceNumber } = await request.json().catch(() => ({}));

    if (!invoiceNumber) {
      return NextResponse.json({ success: false, message: 'Nomor invoice toko dibutuhkan' }, { status: 400 });
    }

    // 1. Ambil data dari Supabase toko
    const { data: tx, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .ilike('invoice_number', invoiceNumber)
      .maybeSingle();

    if (fetchErr || !tx) {
      return NextResponse.json({ success: false, message: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Jika sudah lunas dan akun sudah terisi di DB lokal
    if ((tx.payment_status === 'PAID' || tx.payment_status === 'SUCCESS') && tx.digital_account_details) {
      return NextResponse.json({ success: true, status: 'PAID', transaction: tx });
    }

    // 2. Ekstrak Deposit ID Premku dari api_response_log
    const premkuDepositId = extractPremkuDepositId(tx.api_response_log);

    if (!premkuDepositId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID deposit Premku tidak ditemukan di log transaksi' 
      }, { status: 400 });
    }

    // 3. Cek Status Deposit ke API Premku (/api/pay_status)
    const isPaid = await checkDepositStatus(premkuDepositId);

    // Jika belum dibayar di Premku, return UNPAID (DB Supabase tidak diubah)
    if (!isPaid) {
      return NextResponse.json({
        success: false,
        status: 'UNPAID',
        message: 'Deposit belum dibayar atau belum terkonfirmasi di Premku'
      });
    }

    // 4. Jika Deposit BERHASIL LUNAS -> Otomatis Beli Akun ke Premku (/api/order)
    let accountDetails = tx.digital_account_details || '';
    let deliveryStatus = tx.delivery_status || 'PENDING';

    if (!accountDetails || deliveryStatus !== 'SUCCESS') {
      const orderResult = await createProductOrder({
        productId: tx.api_product_id,
        targetWa: tx.customer_wa,
        invoiceNumber: tx.invoice_number
      });

      accountDetails = orderResult.accountDetails;
      deliveryStatus = orderResult.success ? 'SUCCESS' : 'PROCESS';
    }

    // 5. Update Database Supabase menjadi PAID & SUCCESS
    const { data: updatedTx, error: updateErr } = await supabase
      .from('transactions')
      .update({
        payment_status: 'PAID',
        delivery_status: deliveryStatus,
        digital_account_details: accountDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', tx.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: 'PAID',
      transaction: updatedTx
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}