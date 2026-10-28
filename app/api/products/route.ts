import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PremkuRawProduct {
  id: number | string;
  name: string;
  price: number;
  status: string;
  stock: number;
  [key: string]: unknown;
}

export async function POST() {
  try {
    const apiKey = process.env.PREMKU_API_KEY || '';

    const premkuRes = await fetch('https://premku.com/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ api_key: apiKey }),
      cache: 'no-store',
    });

    if (!premkuRes.ok) throw new Error(`Premku API Error: ${premkuRes.status}`);

    const premkuData = await premkuRes.json();
    let rawProducts: PremkuRawProduct[] = [];
    if (Array.isArray(premkuData)) rawProducts = premkuData;
    else if (premkuData?.data && Array.isArray(premkuData.data)) rawProducts = premkuData.data;
    else if (premkuData?.products && Array.isArray(premkuData.products)) rawProducts = premkuData.products;

    // Ambil data margin presisi dari Supabase settings
    const { data: settings } = await supabase.from('settings').select('key_name, value');

    const marginMap: Record<string, number> = {};
    let defaultMargin = 5000;

    if (settings) {
      settings.forEach((s) => {
        if (s.key_name === 'default_margin') {
          defaultMargin = Number(s.value) || 0;
        } else if (s.key_name.startsWith('margin_')) {
          const productIdKey = s.key_name.replace('margin_', '');
          marginMap[productIdKey] = Number(s.value) || 0;
        }
      });
    }

    const productsWithMargin = rawProducts.map((product) => {
      const productId = String(product.id);
      const basePrice = Number(product.price) || 0;
      const margin = marginMap[productId] !== undefined ? marginMap[productId] : defaultMargin;

      return {
        ...product,
        base_price: basePrice,
        margin: margin,
        price: basePrice + margin, // Harga jual final resmi ORNOTPREM
      };
    });

    return NextResponse.json({ success: true, data: productsWithMargin });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'System error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}