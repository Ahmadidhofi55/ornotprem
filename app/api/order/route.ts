// app/api/order/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Sisipkan API Key ke dalam parameter body
    const payloadToPremku = {
      ...body,
      api_key: process.env.PREMKU_API_KEY || '', 
    };
    
    const res = await fetch('https://premku.com/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Jika dokumentasi Premku juga meminta header, biarkan ini. 
        // Namun error sebelumnya membuktikan mereka butuh di dalam payload.
        'x-api-key': process.env.PREMKU_API_KEY || '',
      },
      // 2. Kirim payload yang sudah digabung dengan api_key
      body: JSON.stringify(payloadToPremku),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}