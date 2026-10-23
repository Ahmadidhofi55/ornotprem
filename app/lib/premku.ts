// app/lib/premku.ts

const PREMKU_API_KEY = process.env.PREMKU_API_KEY || '';

// 1. Ekstrak Deposit ID Premku dari api_response_log
export function extractPremkuDepositId(logData: unknown): string | null {
  if (!logData) return null;

  try {
    let parsed: any = logData;

    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { /* ignore */ }
    }
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { /* ignore */ }
    }

    if (parsed && typeof parsed === 'object') {
      const depId = parsed?.data?.invoice || parsed?.invoice || parsed?.data?.deposit_id;
      if (depId) return String(depId);
    }
  } catch (err) {
    console.error("[PREMKU] Parse log error:", err);
  }

  if (typeof logData === 'string') {
    const match = logData.match(/"invoice"\s*:\s*"([a-f0-9]{24})"/i);
    if (match && match[1]) return match[1];
  }

  return null;
}

// 2. Cek Status Deposit Pembayaran (/api/pay_status)
export async function checkDepositStatus(depositId: string): Promise<boolean> {
  if (!depositId) return false;

  const payloads = [
    { invoice: depositId, api_key: PREMKU_API_KEY },
    { deposit_id: depositId, api_key: PREMKU_API_KEY },
    { invoice: depositId }
  ];

  for (const payload of payloads) {
    try {
      const res = await fetch('https://premku.com/api/pay_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': PREMKU_API_KEY,
          'api-key': PREMKU_API_KEY
        },
        body: JSON.stringify(payload)
      });

      const rawText = await res.text();
      let payData: any = null;
      try { payData = JSON.parse(rawText); } catch { payData = rawText; }

      const statusStr = (
        payData?.data?.status || 
        payData?.status || 
        payData?.payment_status || 
        ''
      ).toString().toUpperCase();

      const validPaid = ['PAID', 'SUCCESS', 'COMPLETED', 'LUNAS', 'SUKSES', 'SELESAI', 'BERHASIL', '1'];
      if (res.ok && validPaid.includes(statusStr)) {
        return true;
      }
    } catch (err) {
      console.error("[PREMKU] Error checkDepositStatus:", err);
    }
  }

  return false;
}

// 3. Tembak Order Baru / Auto Buy (/api/order)
interface OrderParams {
  productId: string | number;
  targetWa: string;
  invoiceNumber: string;
  qty?: number;
}

export interface OrderResponseResult {
  success: boolean;
  isReady: boolean;
  accountDetails: string;
  rawResponse?: any;
}

export async function createProductOrder(params: OrderParams): Promise<OrderResponseResult> {
  try {
    const payload = {
      api_key: PREMKU_API_KEY,
      product_id: Number(params.productId),
      qty: params.qty || 1, // Parameter wajib sesuai dokumentasi
      ref_id: params.invoiceNumber, // Unique Reference ID
      customer_wa: params.targetWa,
      target: params.targetWa
    };

    const res = await fetch('https://premku.com/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PREMKU_API_KEY,
        'api-key': PREMKU_API_KEY
      },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    let data: any = null;
    try { data = JSON.parse(rawText); } catch { data = rawText; }

    const isSuccess = res.ok && (
      data?.success === true || 
      data?.status === 'SUCCESS' || 
      data?.status === true
    );

    const accountDetails = 
      data?.data?.account_details || 
      data?.account_details || 
      data?.data?.sn || 
      data?.sn || 
      data?.data?.credentials || 
      (typeof data?.data === 'string' ? data.data : null);

    if (isSuccess && accountDetails) {
      return { 
        success: true, 
        isReady: true, 
        accountDetails: String(accountDetails), 
        rawResponse: data 
      };
    }

    if (isSuccess) {
      return { 
        success: true, 
        isReady: false, 
        accountDetails: 'Payment confirmed! The account is being processed automatically by the system.', 
        rawResponse: data 
      };
    }

    return { 
      success: false, 
      isReady: false, 
        accountDetails: 'Pembayaran terkonfirmasi! Sistem sedang memproses pengiriman akun Anda.', 
        rawResponse: data 
    };
  } catch (e) {
    console.error("[PREMKU ORDER ERROR]:", e);
    return { 
      success: false, 
      isReady: false, 
      accountDetails: 'Payment confirmed! The account will be delivered periodically.' 
    };
  }
}

// 4. Cek Status Pesanan Produk Ready/Belum (/api/status)
export async function checkOrderStatus(invoiceNumber: string) {
  try {
    const res = await fetch('https://premku.com/api/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PREMKU_API_KEY,
      },
      body: JSON.stringify({
        invoice: invoiceNumber,
        ref_id: invoiceNumber,
        api_key: PREMKU_API_KEY
      }),
    });

    const rawText = await res.text();
    let data: any = null;
    try { data = JSON.parse(rawText); } catch { data = rawText; }

    const accountDetails = 
      data?.data?.account_details || 
      data?.account_details || 
      data?.data?.sn || 
      data?.sn || 
      data?.data?.credentials || 
      (typeof data?.data === 'string' ? data.data : null);

    const statusStr = (data?.data?.status || data?.status || '').toString().toUpperCase();
    const isCompleted = ['SUCCESS', 'COMPLETED', 'SUKSES', 'SELESAI'].includes(statusStr);

    if (accountDetails || isCompleted) {
      return {
        isReady: true,
        accountDetails: accountDetails || JSON.stringify(data)
      };
    }

    return { isReady: false, accountDetails: null };
  } catch (err) {
    console.error("[PREMKU STATUS ERROR]:", err);
    return { isReady: false, accountDetails: null };
  }
}