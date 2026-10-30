// app/api/check-payment/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  extractPremkuDepositId, 
  checkDepositStatus, 
  createProductOrder, 
  checkOrderStatus 
} from '../../lib/premku';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper parsing tanggal yang aman dari masalah timezone
function parseTimestamp(dateStr: string): number {
  if (!dateStr) return Date.now();
  let formatted = dateStr.trim();
  if (!formatted.endsWith('Z') && !formatted.includes('+')) {
    formatted = formatted.replace(' ', 'T') + 'Z';
  }
  const timestamp = new Date(formatted).getTime();
  return isNaN(timestamp) ? new Date(dateStr).getTime() : timestamp;
}

export async function POST(request: Request) {
  try {
    const { invoiceNumber } = await request.json().catch(() => ({}));

    if (!invoiceNumber) {
      return NextResponse.json({ success: false, message: 'Invoice number is required' }, { status: 400 });
    }

    // 1. Ambil data transaksi dari Supabase
    const { data: tx, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .ilike('invoice_number', invoiceNumber)
      .maybeSingle();

    if (fetchErr || !tx) {
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }

    // Jika sudah EXPIRED di database
    if (tx.payment_status === 'EXPIRED' || tx.delivery_status === 'FAILED') {
      return NextResponse.json({
        success: false,
        status: 'EXPIRED',
        message: 'Pembayaran telah kadaluwarsa.',
        transaction: tx
      }, { status: 200 });
    }

    // Jika sudah PAID & SUCCESS
    if (tx.payment_status === 'PAID' && tx.delivery_status === 'SUCCESS' && tx.digital_account_details) {
      return NextResponse.json({ success: true, status: 'PAID', transaction: tx });
    }

    let isPaid = tx.payment_status === 'PAID';

    // 2. PENGECEKAN EXPIRED 120 MENIT (DIJALANKAN PERTAMA KALI)
    if (!isPaid) {
      const createdTime = parseTimestamp(tx.created_at);
      const currentTime = Date.now();
      const EXPIRE_LIMIT_MS = 120 * 60 * 1000; // 120 Menit
      const isTimeExpired = (currentTime - createdTime) > EXPIRE_LIMIT_MS;

      // Cek juga status dari API Premku (jika ada)
      const premkuDepositId = extractPremkuDepositId(tx.api_response_log);
      let depositStatusResult: any = false;

      if (premkuDepositId) {
        depositStatusResult = await checkDepositStatus(premkuDepositId);
      }

      const depositIsPaid = typeof depositStatusResult === 'boolean' 
        ? depositStatusResult 
        : Boolean(depositStatusResult?.isPaid);

      const depositIsExpired = typeof depositStatusResult === 'object' && depositStatusResult?.isExpired;

      if (depositIsPaid) {
        isPaid = true;
      } else if (isTimeExpired || depositIsExpired) {
        // UPDATE DATABASE SUPABASE JADI EXPIRED & FAILED
        const { data: expiredTx } = await supabase
          .from('transactions')
          .update({
            payment_status: 'EXPIRED',
            delivery_status: 'FAILED',
            updated_at: new Date().toISOString()
          })
          .eq('id', tx.id)
          .select()
          .single();

        return NextResponse.json({
          success: false,
          status: 'EXPIRED',
          message: 'Waktu pembayaran QRIS telah kadaluwarsa (120 Menit).',
          transaction: expiredTx || { ...tx, payment_status: 'EXPIRED', delivery_status: 'FAILED' }
        }, { status: 200 });
      } else {
        return NextResponse.json({ 
          success: false, 
          status: 'UNPAID',
          message: 'Deposit belum terkonfirmasi lunas di Premku.' 
        }, { status: 200 });
      }
    }

    // 3. Auto-buy & pengiriman akun jika LUNAS
    let deliveryStatus = tx.delivery_status || 'PENDING';
    let accountDetails = tx.digital_account_details || '';

    if (deliveryStatus !== 'SUCCESS') {
      if (deliveryStatus === 'PENDING' || !accountDetails) {
        const orderRes = await createProductOrder({
          productId: tx.api_product_id,
          targetWa: tx.customer_wa,
          invoiceNumber: tx.invoice_number
        });

        if (orderRes.isReady) {
          deliveryStatus = 'SUCCESS';
          accountDetails = orderRes.accountDetails;
        } else {
          deliveryStatus = 'PROCESS';
          accountDetails = orderRes.accountDetails;
        }
      } 

      if (deliveryStatus === 'PROCESS') {
        const statusCheck = await checkOrderStatus(tx.invoice_number);
        if (statusCheck.isReady && statusCheck.accountDetails) {
          deliveryStatus = 'SUCCESS';
          accountDetails = statusCheck.accountDetails;
        }
      }
    }

    // 4. Hitung Margin
    const totalPrice = Number(tx.total_price) || 0;
    const baseCostPrice = Number(tx.base_cost_price || tx.cost_price || 0);
    const calculatedMargin = deliveryStatus === 'SUCCESS' 
      ? Math.max(0, totalPrice - baseCostPrice) 
      : (Number(tx.margin) || 0);

    // 5. Update Transaksi Lunas di Supabase
    const { data: updatedTx, error: updateErr } = await supabase
      .from('transactions')
      .update({
        payment_status: 'PAID',
        delivery_status: deliveryStatus,
        digital_account_details: accountDetails,
        margin: calculatedMargin,
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
    const msg = error instanceof Error ? error.message : 'System error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}