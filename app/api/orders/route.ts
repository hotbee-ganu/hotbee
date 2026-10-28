import { NextResponse } from 'next/server';
import { fetchSkuMap, persistOrder } from '@/lib/catalog-server';
import { submitOrderToQikink } from '@/lib/qikink-server';
import { verifyRazorpaySignature } from '@/lib/razorpay-server';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Places an order: verifies the payment (for prepaid), stores it in Supabase,
 * then pushes the print job to Qikink. Runs server-side so the Razorpay secret
 * and Qikink credentials never reach the browser.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const order = body?.order as Order | undefined;

  if (!order?.id || !order.items?.length) {
    return NextResponse.json({ error: 'A valid order with line items is required.' }, { status: 400 });
  }

  // Prepaid orders must carry a signature we can verify before we print anything.
  if (order.paymentStatus === 'paid') {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body || {};

    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      if (!verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
        return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
      }
    } else if (process.env.RAZORPAY_SECRET && !process.env.RAZORPAY_SECRET.includes('your_razorpay')) {
      return NextResponse.json(
        { error: 'Payment could not be verified - missing Razorpay confirmation.' },
        { status: 400 }
      );
    }
  }

  const skuMap = await fetchSkuMap(order.items.map((i) => i.productId));
  const push = await submitOrderToQikink(order, skuMap);

  const finalOrder: Order = {
    ...order,
    qikinkOrderId: push.qikinkOrderId || order.qikinkOrderId,
    status: push.success ? 'qikink_submitted' : 'placed',
  };

  try {
    await persistOrder({ ...finalOrder, qikinkSyncMessage: push.message });
  } catch (err) {
    // The customer has paid - never fail the request because our DB write did.
    console.error('[orders] Supabase persist failed:', err);
  }

  return NextResponse.json({
    order: finalOrder,
    qikink: { success: push.success, mode: push.mode, message: push.message },
  });
}
