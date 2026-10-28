import { NextResponse } from 'next/server';

// Whitelist endpoint yang diizinkan untuk proxy demi keamanan
const ALLOWED_ENDPOINTS = ['products', 'order', 'profile', 'status'];

export async function POST(request: Request) {
  try {
    const { endpoint, bodyData } = await request.json();

    if (!endpoint || !ALLOWED_ENDPOINTS.includes(endpoint)) {
      return NextResponse.json(
        { success: false, message: 'Endpoint tidak diizinkan atau tidak valid.' },
        { status: 400 }
      );
    }

    const premkuUrl = `https://premku.com/api/${endpoint}`;
    const serverApiKey = process.env.PREMKU_API_KEY;

    if (!serverApiKey) {
      return NextResponse.json(
        { success: false, message: 'Server API Key not configured.' },
        { status: 500 }
      );
    }

    const finalBodyData = {
      ...bodyData,
      api_key: serverApiKey,
    };

    const response = await fetch(premkuUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': serverApiKey,
      },
      body: JSON.stringify(finalBodyData),
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}