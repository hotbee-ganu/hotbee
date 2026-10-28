import { NextResponse } from 'next/server';
import { createRazorpayOrder, isRazorpayServerConfigured } from '@/lib/razorpay-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  const receipt = String(body?.receipt || `hb-${Date.now()}`).slice(0, 40);

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'A positive amount is required.' }, { status: 400 });
  }

  if (!isRazorpayServerConfigured()) {
    // Demo mode: the checkout falls back to its simulated payment flow.
    return NextResponse.json({ configured: false, keyId: null, order: null });
  }

  try {
    const order = await createRazorpayOrder(amount, receipt);
    return NextResponse.json({
      configured: true,
      keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not start the payment.' },
      { status: 502 }
    );
  }
}
