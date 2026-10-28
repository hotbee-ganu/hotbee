import { Order } from './types';

/**
 * Server-only Qikink client.
 *
 * Verified against the live API on 27 Aug 2026. The Qikink REST surface is
 * intentionally small - these are the only routes that exist:
 *   POST /api/token         -> { ClientId, Accesstoken, expires_in }
 *   GET  /api/order         -> list orders placed through the API
 *   POST /api/order/create  -> push a new print job (requires line_items)
 *
 * There is NO product / design / SKU listing endpoint, so the storefront
 * catalogue is owned by Supabase (see lib/catalog-server.ts) and Qikink is
 * used purely for fulfilment.
 */

const QIKINK_BASE = (process.env.QIKINK_BASE_URL || 'https://sandbox.qikink.com/api').replace(/\/$/, '');

export const qikinkCredentials = () => ({
  clientId: process.env.QIKINK_API_KEY || '',
  clientSecret: process.env.QIKINK_API_SECRET || '',
});

export const isQikinkConfigured = () => {
  const { clientId, clientSecret } = qikinkCredentials();
  return Boolean(
    clientId && clientSecret && !clientId.includes('your_qikink') && !clientSecret.includes('your_qikink')
  );
};

/** True when pointed at the sandbox rather than production Qikink. */
export const isQikinkSandbox = () => QIKINK_BASE.includes('sandbox');

// --- Access token (valid 3600s; cached in-process with a 60s safety margin) ---

let tokenCache: { token: string; expiresAt: number } | null = null;

export const getQikinkToken = async (): Promise<string> => {
  if (!isQikinkConfigured()) throw new Error('Qikink API credentials are not configured.');
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token;

  const { clientId, clientSecret } = qikinkCredentials();
  const body = new URLSearchParams({ ClientId: clientId, client_secret: clientSecret });

  const res = await fetch(`${QIKINK_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.Accesstoken) {
    throw new Error(data?.error || `Qikink token request failed (HTTP ${res.status}).`);
  }

  const ttl = Number(data.expires_in) || 3600;
  tokenCache = { token: data.Accesstoken, expiresAt: Date.now() + (ttl - 60) * 1000 };
  return tokenCache.token;
};

/** Invalidate the cached token - used when Qikink answers 401 mid-flight. */
export const resetQikinkToken = () => {
  tokenCache = null;
};

// --- Authenticated request helper (retries once on an expired token) ---

const qikinkRequest = async <T>(path: string, init: RequestInit = {}, retry = true): Promise<T> => {
  const { clientId } = qikinkCredentials();
  const token = await getQikinkToken();

  const res = await fetch(`${QIKINK_BASE}${path}`, {
    ...init,
    headers: {
      ClientId: clientId,
      Accesstoken: token,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  if (res.status === 401 && retry) {
    resetQikinkToken();
    return qikinkRequest<T>(path, init, false);
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Qikink returned a non-JSON response for ${path} (HTTP ${res.status}).`);
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Qikink ${path} failed (HTTP ${res.status}).`);
  }

  return data as T;
};

// --- SKU resolution ---

const SIZE_TOKENS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

/**
 * Qikink "My Products" SKUs encode the variant, e.g. MRnHs-Wh-S.
 * Admins store a base SKU per product; we append the ordered size unless the
 * stored SKU already carries one.
 */
export const buildQikinkSku = (baseSku: string | undefined, size: string): string => {
  const base = (baseSku || '').trim();
  if (!base) return '';

  const lastSegment = base.split('-').pop()?.toUpperCase() || '';
  if (SIZE_TOKENS.includes(lastSegment)) return base;

  const normalisedSize = (size || '').trim().toUpperCase();
  return normalisedSize ? `${base}-${normalisedSize}` : base;
};

// --- Order push ---

export interface QikinkPushResult {
  success: boolean;
  mode: 'live' | 'sandbox' | 'simulated';
  qikinkOrderId?: string;
  message: string;
  raw?: unknown;
}

const splitName = (fullName: string) => {
  const parts = (fullName || '').trim().split(/\s+/);
  return {
    first_name: parts[0] || 'Customer',
    last_name: parts.slice(1).join(' ') || '.',
  };
};

/**
 * Qikink rejects order numbers containing any special character
 * ("Order No cannot contain special characters"), and our customer-facing ids
 * look like HB-89421. Strip everything non-alphanumeric for the API call while
 * the original id stays on the invoice and in Supabase.
 */
export const toQikinkOrderNumber = (orderId: string) =>
  (orderId || '').replace(/[^a-zA-Z0-9]/g, '');

export const buildQikinkOrderPayload = (order: Order, skuByProductId: Record<string, string> = {}) => {
  const { first_name, last_name } = splitName(order.customerName);
  const addr = order.shippingAddress;
  const isCod = order.paymentStatus !== 'paid';
  const isSandbox = isQikinkSandbox();

  return {
    order_number: toQikinkOrderNumber(order.id),
    qikink_shipping: '1', // let Qikink arrange the courier
    gateway: isCod ? 'COD' : 'Prepaid',
    total_order_value: String(order.totalAmount),
    line_items: order.items.map((item) => {
      const sku = buildQikinkSku(skuByProductId[item.productId], item.selectedSize) || 'MRnHs-Bk-M';
      return {
        search_from_my_products: isSandbox ? 0 : 1,
        ...(isSandbox ? { print_type_id: 1 } : {}),
        sku,
        quantity: String(item.quantity),
        price: String(item.price),
      };
    }),
    shipping_address: {
      first_name,
      last_name,
      address1: addr.street,
      address2: addr.landmark || '',
      phone: (addr.phone || order.customerPhone || '').replace(/\D/g, '').slice(-10),
      email: addr.email || order.customerEmail,
      city: addr.city,
      zip: addr.pincode,
      province: addr.state,
      country_code: 'IN',
    },
  };
};

export const submitOrderToQikink = async (
  order: Order,
  skuByProductId: Record<string, string> = {}
): Promise<QikinkPushResult> => {
  if (!isQikinkConfigured()) {
    return {
      success: true,
      mode: 'simulated',
      qikinkOrderId: `QK-SIM-${Math.floor(10000 + Math.random() * 90000)}`,
      message: 'Qikink keys are not set - order recorded locally without a print job.',
    };
  }

  const payload = buildQikinkOrderPayload(order, skuByProductId);
  const missingSku = payload.line_items.filter((li) => !li.sku);

  if (missingSku.length > 0) {
    return {
      success: false,
      mode: isQikinkSandbox() ? 'sandbox' : 'live',
      message: `${missingSku.length} item(s) have no Qikink SKU set. Add the SKU on the product in Admin > Products before this order can be printed.`,
    };
  }

  try {
    const data = await qikinkRequest<any>('/order/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const qikinkOrderId = data?.order_id ? String(data.order_id) : data?.id ? String(data.id) : undefined;
    const accepted = Boolean(qikinkOrderId) || data?.status === 'success' || data?.status === true;

    return {
      success: accepted,
      mode: isQikinkSandbox() ? 'sandbox' : 'live',
      qikinkOrderId,
      message: accepted
        ? `Print job accepted by Qikink${qikinkOrderId ? ` (${qikinkOrderId})` : ''}.`
        : data?.message || 'Qikink did not confirm the print job.',
      raw: data,
    };
  } catch (err) {
    return {
      success: false,
      mode: isQikinkSandbox() ? 'sandbox' : 'live',
      message: err instanceof Error ? err.message : 'Unknown Qikink error.',
    };
  }
};

// --- Order status pull ---

export interface QikinkRemoteOrder {
  orderNumber?: string;
  qikinkOrderId?: string;
  status?: string;
  trackingNumber?: string;
  courierName?: string;
}

export const listQikinkOrders = async (): Promise<QikinkRemoteOrder[]> => {
  const data = await qikinkRequest<any>('/order', { method: 'GET' });
  const rows: any[] = Array.isArray(data) ? data : data?.data || [];

  return rows.map((row) => ({
    orderNumber: row.order_number ?? row.number,
    qikinkOrderId: row.id ? String(row.id) : undefined,
    status: row.order_status ?? row.status,
    trackingNumber: row.awb ?? row.tracking_number ?? row.shipment_tracking_id,
    courierName: row.courier ?? row.courier_name ?? row.shipping_provider,
  }));
};

/** Map a Qikink status string onto our internal order status. */
export const mapQikinkStatus = (raw: string | undefined): Order['status'] | null => {
  const s = (raw || '').toLowerCase();
  if (!s) return null;
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('deliver')) return 'delivered';
  if (s.includes('ship') || s.includes('dispatch') || s.includes('transit')) return 'shipped';
  if (s.includes('print') || s.includes('production') || s.includes('process')) return 'printing';
  if (s.includes('receive') || s.includes('confirm') || s.includes('accept') || s.includes('pending')) {
    return 'qikink_submitted';
  }
  return null;
};

export const qikinkConnectionStatus = async () => {
  if (!isQikinkConfigured()) {
    return { connected: false, mode: 'not-configured' as const, message: 'Qikink API keys are not set.' };
  }
  try {
    await getQikinkToken();
    return {
      connected: true,
      mode: (isQikinkSandbox() ? 'sandbox' : 'live') as 'sandbox' | 'live',
      message: isQikinkSandbox()
        ? 'Connected to the Qikink SANDBOX. Orders will not actually be printed.'
        : 'Connected to Qikink production. Orders will be printed and shipped.',
    };
  } catch (err) {
    return {
      connected: false,
      mode: 'error' as const,
      message: err instanceof Error ? err.message : 'Could not reach Qikink.',
    };
  }
};

export const triggerSandboxTestOrder = async () => {
  if (!isQikinkConfigured()) {
    throw new Error('Qikink API credentials not configured');
  }

  const orderNum = 'HBTEST' + Math.floor(100000 + Math.random() * 900000);
  const testOrder = {
    order_number: orderNum,
    qikink_shipping: '1',
    gateway: 'Prepaid',
    total_order_value: '499',
    line_items: [
      {
        search_from_my_products: 0,
        sku: 'MRnHs-Bk-M',
        quantity: '1',
        price: '499',
        print_type_id: 1,
      },
    ],
    shipping_address: {
      first_name: 'Test',
      last_name: 'Customer',
      address1: '123 Test Street, Cyber Hub',
      phone: '9876543210',
      email: 'test@hotbee.in',
      city: 'Bengaluru',
      zip: '560001',
      province: 'Karnataka',
      country_code: 'IN',
    },
  };

  const data = await qikinkRequest<any>('/order/create', {
    method: 'POST',
    body: JSON.stringify(testOrder),
  });

  return {
    success: true,
    orderId: data?.order_id ? String(data.order_id) : undefined,
    message: data?.message || 'Sandbox order placed successfully',
    raw: data,
  };
};

