// app/api/cron/check-pending/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractPremkuDepositId, checkDepositStatus, createProductOrder } from '../../../lib/premku';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
  try {
    // Ambil transaksi berstatus PENDING dari database
    const { data: pendingTxs } = await supabase
      .from('transactions')
      .select('*')
      .eq('payment_status', 'PENDING')
      .limit(20);

    if (!pendingTxs || pendingTxs.length === 0) {
      return NextResponse.json({ message: 'Tidak ada transaksi pending.' });
    }

    let updatedCount = 0;

    for (const tx of pendingTxs) {
      const depositId = extractPremkuDepositId(tx.api_response_log);
      if (!depositId) continue;

      const isPaid = await checkDepositStatus(depositId);

      if (isPaid) {
        const orderRes = await createProductOrder({
          productId: tx.api_product_id,
          targetWa: tx.customer_wa,
          invoiceNumber: tx.invoice_number
        });

        await supabase
          .from('transactions')
          .update({
            payment_status: 'PAID',
            delivery_status: orderRes.success ? 'SUCCESS' : 'PROCESS',
            digital_account_details: orderRes.accountDetails,
            updated_at: new Date().toISOString()
          })
          .eq('id', tx.id);

        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, processed: pendingTxs.length, updated: updatedCount });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}