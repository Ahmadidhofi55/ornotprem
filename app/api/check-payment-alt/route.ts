// app/api/check-payment-alt/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AccountItem {
  username?: string;
  email?: string;
  password?: string;
  link?: string;
  url?: string;
}

export async function POST(req: Request) {
  try {
    const { invoiceNumber } = await req.json();
    if (!invoiceNumber) {
      return NextResponse.json({ error: 'Nomor invoice wajib disertakan' }, { status: 400 });
    }

    const cleanInvoice = invoiceNumber.trim();
    console.log("Mengecek status & akun dari API untuk invoice:", cleanInvoice);

    // 1. Ambil data transaksi dari Supabase
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .ilike('invoice_number', `%${cleanInvoice}%`)
      .maybeSingle();

    if (txError || !tx) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan di database' }, { status: 404 });
    }

    // 2. Ambil invoice deposit dari log jika ada
    let premkuInvoice = '';
    if (tx.api_response_log) {
      try {
        const parsed = JSON.parse(tx.api_response_log);
        premkuInvoice = parsed.premku_deposit_invoice || parsed.invoice || '';
      } catch (e) {
        console.error("Gagal parsing log:", e);
      }
    }

    let accountDetailsText = tx.digital_account_details || 'Akun premium sedang disiapkan.';
    let isPaid = false;

    // 3. Tembak API Premku (untuk cek status sekaligus mengambil data akun jika disediakan dalam respons)
    if (premkuInvoice) {
      try {
        const response = await fetch('https://premku.com/api/pay_status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.PREMKU_API_KEY as string,
            invoice: premkuInvoice
          }),
          cache: 'no-store'
        });
        const result = await response.json();
        console.log("RESPONS API PREMKU:", JSON.stringify(result));

        // Cek status lunas
        const resStr = JSON.stringify(result).toLowerCase();
        if (
          result.success === true ||
          resStr.includes('success') ||
          resStr.includes('paid') ||
          resStr.includes('settlement') ||
          resStr.includes('lunas') ||
          resStr.includes('completed')
        ) {
          isPaid = true;
        }

        // Ambil data akun dari respons API Premku (sesuaikan struktur key JSON dari API mereka)
        const accountsData = result.accounts || result.data?.accounts || result.detail || result.data;
        if (accountsData) {
          if (Array.isArray(accountsData) && accountsData.length > 0) {
            // Jika berupa array list akun
            accountDetailsText = accountsData.map((acc: AccountItem, index: number) => {
              return `Data Akun (${index + 1})
User/Email: ${acc.username || acc.email || '-'}
Password: ${acc.password || '-'}
Akses: ${acc.link || acc.url || '-'}`;
            }).join('\n\n');
          } else if (typeof accountsData === 'object') {
            // Jika berupa objek tunggal
            const acc: AccountItem = accountsData;
            if (acc.email || acc.username || acc.password) {
              accountDetailsText = `Data Akun (1)
User/Email: ${acc.username || acc.email || '-'}
Password: ${acc.password || '-'}
Akses: ${acc.link || acc.url || '-'}`;
            }
          }
        }
      } catch (apiErr) {
        console.error("Gagal koneksi ke API Premku:", apiErr);
      }
    } else {
      // Jika tidak ada invoice deposit, anggap langsung sinkron untuk testing
      isPaid = true;
    }

    // 4. Update database Supabase dengan status PAID dan detail akun dari API
    const updatePayload: Record<string, string> = {
      delivery_status: 'SUCCESS',
      digital_account_details: accountDetailsText
    };

    if (isPaid) {
      updatePayload.payment_status = 'PAID';
    }

    const { data: updateData, error: updateErr } = await supabase
      .from('transactions')
      .update(updatePayload)
      .eq('id', tx.id)
      .select();

    if (updateErr) {
      console.error("Gagal update database:", updateErr.message);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      status: isPaid ? 'PAID' : tx.payment_status,
      updated: updateData 
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}