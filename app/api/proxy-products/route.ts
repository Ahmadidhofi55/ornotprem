// app/api/proxy-products/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { endpoint, bodyData } = await request.json();
    
    const premkuUrl = `https://premku.com/api/${endpoint}`;

    // Ambil API Key dari server-side env (aman dari client/browser)
    const serverApiKey = process.env.PREMKU_API_KEY;

    if (!serverApiKey) {
      return NextResponse.json({ success: false, message: 'Server API Key not configured.' }, { status: 500 });
    }

    // Gabungkan body data dengan api_key dari server
    const finalBodyData = {
      ...bodyData,
      api_key: serverApiKey,
    };

    const response = await fetch(premkuUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalBodyData),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}