import crypto from 'crypto';

/** Server-only Razorpay helpers. The secret must never reach the client. */

const keyId = () => process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const keySecret = () => process.env.RAZORPAY_SECRET || '';

export const isRazorpayServerConfigured = () => {
  const id = keyId();
  const secret = keySecret();
  return Boolean(id && secret && !id.includes('your_razorpay') && !secret.includes('your_razorpay'));
};

export const isRazorpayLive = () => keyId().startsWith('rzp_live_');

/** Create a Razorpay order so the amount is fixed server-side, not by the browser. */
export const createRazorpayOrder = async (amountInRupees: number, receipt: string) => {
  if (!isRazorpayServerConfigured()) {
    throw new Error('Razorpay keys are not configured.');
  }

  const auth = Buffer.from(`${keyId()}:${keySecret()}`).toString('base64');

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amountInRupees * 100), // paise
      currency: 'INR',
      receipt,
      payment_capture: 1,
    }),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.id) {
    throw new Error(data?.error?.description || `Razorpay order creation failed (HTTP ${res.status}).`);
  }

  return { id: data.id as string, amount: data.amount as number, currency: data.currency as string };
};

export const verifyRazorpaySignature = (input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean => {
  const secret = keySecret();
  if (!secret) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(input.razorpaySignature || '');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

export const razorpayConnectionStatus = () => {
  if (!isRazorpayServerConfigured()) {
    return { connected: false, mode: 'not-configured' as const, message: 'Razorpay keys are not set.' };
  }
  return {
    connected: true,
    mode: (isRazorpayLive() ? 'live' : 'test') as 'live' | 'test',
    message: isRazorpayLive()
      ? 'Live Razorpay keys - real money will be collected.'
      : 'Razorpay TEST keys - payments are simulated, no real money moves.',
  };
};
