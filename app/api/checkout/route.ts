// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PremkuProduct {
  id: number | string;
  name: string;
  price: number | string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, productName, customerWa, customerEmail, paymentChannel, productImage } = body;

    if (!productId || !customerWa) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 1. Ambil Setting Harga dari Supabase
    const { data: settingsData } = await supabase.from('settings').select('key_name, value').in('key_name', ['min_margin', 'max_margin']);
    let minMargin = 500;
    let maxMargin = 1000;
    if (settingsData) {
      const minS = settingsData.find(s => s.key_name === 'min_margin');
      const maxS = settingsData.find(s => s.key_name === 'max_margin');
      if (minS) minMargin = Number(minS.value);
      if (maxS) maxMargin = Number(maxS.value);
    }

    // 2. Ambil Harga Modal Asli dari Premku
    const premkuRes = await fetch('https://premku.com/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.PREMKU_API_KEY as string },
      body: JSON.stringify({}),
      cache: 'no-store'
    });
    
    if (!premkuRes.ok) throw new Error('Gagal terhubung ke server pusat');
    const premkuData = await premkuRes.json();
    const rawProducts = Array.isArray(premkuData) ? premkuData : (premkuData.data || premkuData.products || []);
    
    const product = rawProducts.find((p: PremkuProduct) => String(p.id) === String(productId));
    if (!product) throw new Error('Produk tidak ditemukan atau tidak tersedia');

    // 3. Kalkulasi Harga Dasar (Harga Asli + Margin)
    const basePrice = Number(product.price);
    const brandName = product.name ? product.name.split(' ')[0].toLowerCase() : 'lainnya';
    const diff = maxMargin - minMargin;
    const steps = diff > 0 ? Math.floor(diff / 100) + 1 : 1;
    
    let hash = 0;
    for (let i = 0; i < brandName.length; i++) hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
    const margin = minMargin + (Math.abs(hash) % steps) * 100;
    const initialTotalPrice = basePrice + margin;

    // 4. REQUEST QRIS & KODE UNIK KE API PREMKU (Deposit)
    const payRes = await fetch('https://premku.com/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.PREMKU_API_KEY as string,
        amount: initialTotalPrice
      }),
      cache: 'no-store'
    });

    const payData = await payRes.json();
    if (!payData.success) {
      throw new Error(payData.message || 'Gagal men-generate QRIS Pembayaran');
    }

    // Ambil data penting dari respon API Premku
    const { invoice: premkuDepositInvoice, total_bayar, kode_unik, qr_image } = payData.data;

    // 5. Generate Nomor Invoice ORNOT PREM
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 6. Simpan ke Database Supabase (Menyimpan gambar icon & QRIS di log)
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert([
        {
          invoice_number: invoiceNumber,
          api_product_id: String(productId),
          product_name: product.name || productName,
          customer_wa: customerWa,
          customer_email: customerEmail || null,
          base_price: basePrice,
          margin: margin,
          total_price: total_bayar, // Total sudah termasuk kode unik dari API
          payment_channel: paymentChannel || 'QRIS',
          payment_status: 'UNPAID',
          delivery_status: 'PENDING',
          // Kita titipkan data QRIS dan Ikon di kolom ini agar bisa dipanggil di halaman Invoice
          api_response_log: JSON.stringify({
            premku_deposit_invoice: premkuDepositInvoice,
            kode_unik: kode_unik,
            qr_image: qr_image,
            product_icon: productImage
          })
        }
      ])
      .select()
      .single();

    if (txError) throw txError;

    return NextResponse.json({ success: true, invoice: txData.invoice_number });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}