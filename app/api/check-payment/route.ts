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

    if (tx.payment_status === 'PAID' && tx.delivery_status === 'SUCCESS' && tx.digital_account_details) {
      return NextResponse.json({ success: true, status: 'PAID', transaction: tx });
    }

    let isPaid = tx.payment_status === 'PAID';

    // 2. Cek status deposit jika belum PAID
    if (!isPaid) {
      const premkuDepositId = extractPremkuDepositId(tx.api_response_log);
      if (!premkuDepositId) {
        return NextResponse.json({ success: false, message: 'ID deposit Premku not found in the log' }, { status: 400 });
      }

      isPaid = await checkDepositStatus(premkuDepositId);

      if (!isPaid) {
        return NextResponse.json({
          success: false,
          status: 'UNPAID',
          message: 'Deposit has not been confirmed paid off in Premku yet. Please wait for the payment confirmation.'
        });
      }
    }

    // 3. Auto-buy & cek ketersediaan akun
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

    // 4. Hitung Margin/Profit otomatis (Total Jual - Harga Modal/Base Cost)
    const totalPrice = Number(tx.total_price) || 0;
    const baseCostPrice = Number(tx.base_cost_price || tx.cost_price || 0);
    
    // Margin cuma dihitung/diisi kalo pengiriman akun udah SUCCESS
    const calculatedProfit = deliveryStatus === 'SUCCESS' 
      ? Math.max(0, totalPrice - baseCostPrice) 
      : (Number(tx.profit) || 0);

    // 5. Update status, detail akun, dan profit ke Supabase
    const { data: updatedTx, error: updateErr } = await supabase
      .from('transactions')
      .update({
        payment_status: 'PAID',
        delivery_status: deliveryStatus,
        digital_account_details: accountDetails,
        profit: calculatedProfit, // Mengisi kolom profit/margin otomatis
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
    const msg = error instanceof Error ? error.message : 'System error without specific message';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}