// app/api/products/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const res = await fetch('https://premku.com/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Menggunakan API Key yang aman (hanya terbaca di server)
        'x-api-key': process.env.PREMKU_API_KEY || '', 
      },
      body: JSON.stringify({}),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}