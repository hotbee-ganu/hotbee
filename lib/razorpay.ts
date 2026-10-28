/**
 * Client-side Razorpay checkout.
 *
 * The amount and the Razorpay order are created by /api/razorpay/order so the
 * browser cannot tamper with the price, and the signature is verified by
 * /api/orders before any print job is sent to Qikink.
 */

export interface RazorpayOptions {
  amount: number; // in INR
  receipt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
}

export interface RazorpaySuccess {
  paymentId: string;
  razorpayOrderId?: string;
  signature?: string;
  /** True when no live keys are configured and we ran the demo flow. */
  simulated: boolean;
}

export const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const triggerRazorpayPayment = async (
  options: RazorpayOptions,
  onSuccess: (result: RazorpaySuccess) => void | Promise<void>,
  onFailure: (error: string) => void
) => {
  let init: { configured: boolean; keyId: string | null; order: { id: string; amount: number } | null };

  try {
    const res = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: options.amount, receipt: options.receipt }),
    });
    const data = await res.json();
    if (!res.ok) {
      onFailure(data?.error || 'Could not start the payment. Please try again.');
      return;
    }
    init = data;
  } catch {
    onFailure('Network error while starting the payment. Please check your connection.');
    return;
  }

  // Demo mode - no Razorpay keys configured yet.
  if (!init.configured || !init.order || !init.keyId) {
    await onSuccess({
      paymentId: `pay_demo_${Math.random().toString(36).slice(2, 12)}`,
      simulated: true,
    });
    return;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure('Failed to load the Razorpay checkout. Please check your internet connection.');
    return;
  }

  const rzp = new (window as any).Razorpay({
    key: init.keyId,
    order_id: init.order.id,
    amount: init.order.amount,
    currency: 'INR',
    name: 'HOTBEE',
    description: options.description,
    image: '/logo-256.jpg',
    prefill: {
      name: options.customerName,
      email: options.customerEmail,
      contact: options.customerPhone,
    },
    theme: { color: '#ff9d00' },
    handler: (response: any) => {
      void onSuccess({
        paymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
        simulated: false,
      });
    },
    modal: {
      ondismiss: () => onFailure('Payment was cancelled.'),
    },
  });

  rzp.on('payment.failed', (response: any) => {
    onFailure(response?.error?.description || 'Payment failed. Please try another method.');
  });

  rzp.open();
};
