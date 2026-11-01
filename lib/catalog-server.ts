import { Product } from './types';
import { getSupabaseAdmin } from './supabase-server';

/**
 * Supabase is the source of truth for the catalogue, because Qikink exposes no
 * product listing API. Designs uploaded in Admin > Designs become rows here.
 */

export interface DesignRow {
  id: string;
  fileName: string;
  imageUrl: string;
  storagePath: string;
  qikinkSku: string | null;
  publishedProductId: string | null;
  createdAt: string;
}

const rowToProduct = (row: any): Product => ({
  id: row.id,
  qikink_id: row.qikink_id || undefined,
  title: row.title,
  slug: row.slug,
  description: row.description || '',
  price: Number(row.price),
  originalPrice: Number(row.original_price ?? row.price),
  discountPercentage: Number(row.discount_percentage ?? 0),
  rating: Number(row.rating ?? 5),
  reviewsCount: Number(row.reviews_count ?? 0),
  category: row.category,
  collection: row.collection || 'General Drop',
  images: Array.isArray(row.images) ? row.images : [],
  colors: Array.isArray(row.colors) ? row.colors : [],
  sizes: Array.isArray(row.sizes) ? row.sizes : ['S', 'M', 'L', 'XL'],
  inStock: row.in_stock ?? true,
  isTrending: row.is_trending ?? false,
  isNew: row.is_new ?? true,
  material: row.material || '240 GSM Combed Cotton',
  printType: row.print_type || 'Qikink DTF Print',
  shippingInfo: row.shipping_info || 'Dispatched within 24 hours via Qikink POD',
});

const productToRow = (p: Product) => ({
  id: p.id,
  qikink_id: p.qikink_id || null,
  title: p.title,
  slug: p.slug,
  description: p.description,
  price: p.price,
  original_price: p.originalPrice,
  discount_percentage: p.discountPercentage,
  rating: p.rating,
  reviews_count: p.reviewsCount,
  category: p.category,
  collection: p.collection,
  images: p.images,
  colors: p.colors,
  sizes: p.sizes,
  in_stock: p.inStock,
  is_trending: p.isTrending ?? false,
  is_new: p.isNew ?? true,
  material: p.material,
  print_type: p.printType,
  shipping_info: p.shippingInfo,
});

/**
 * True when Supabase is reachable but the schema has not been created yet.
 * The app treats this like "not configured" so the storefront keeps working
 * on seed data instead of erroring.
 */
export const isMissingTableError = (message: string | undefined) => {
  const m = (message || '').toLowerCase();
  return m.includes('could not find the table') || m.includes('does not exist');
};

export const isConnectionError = (err: unknown): boolean => {
  if (!err) return false;
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes('fetch failed') ||
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('network') ||
    msg.includes('timeout')
  );
};

export class SupabaseUnreachableError extends Error {
  constructor(message?: string) {
    super(
      message ||
        'Cannot reach Supabase database. The project may be paused in your Supabase dashboard, or the URL is unreachable.'
    );
    this.name = 'SupabaseUnreachableError';
  }
}

export class SetupRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SetupRequiredError';
  }
}

export const fetchProducts = async (): Promise<Product[] | null> => {
  const db = getSupabaseAdmin();
  if (!db) return null;

  try {
    const { data, error } = await db.from('products').select('*').order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error.message)) {
        throw new SetupRequiredError(
          'The database tables have not been created yet. Run supabase/setup.sql in the Supabase SQL editor.'
        );
      }
      throw new Error(error.message);
    }

    return (data || []).map(rowToProduct);
  } catch (err) {
    if (err instanceof SetupRequiredError) throw err;
    if (isConnectionError(err)) {
      throw new SupabaseUnreachableError();
    }
    throw err;
  }
};

export const upsertProduct = async (product: Product): Promise<Product> => {
  const db = getSupabaseAdmin();
  if (!db) throw new Error('Supabase is not configured.');

  try {
    const { data, error } = await db.from('products').upsert(productToRow(product)).select().single();
    if (error) throw new Error(error.message);
    return rowToProduct(data);
  } catch (err) {
    if (isConnectionError(err)) throw new SupabaseUnreachableError();
    throw err;
  }
};

export const deleteProductById = async (id: string): Promise<void> => {
  const db = getSupabaseAdmin();
  if (!db) throw new Error('Supabase is not configured.');

  try {
    const { error } = await db.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  } catch (err) {
    if (isConnectionError(err)) throw new SupabaseUnreachableError();
    throw err;
  }
};

/** SKU lookup used when pushing an order to Qikink. */
export const fetchSkuMap = async (productIds: string[]): Promise<Record<string, string>> => {
  const db = getSupabaseAdmin();
  if (!db || productIds.length === 0) return {};

  try {
    const { data, error } = await db.from('products').select('id, qikink_id').in('id', productIds);
    if (error) return {};

    return (data || []).reduce<Record<string, string>>((acc, row: any) => {
      if (row.qikink_id) acc[row.id] = row.qikink_id;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

// --- Designs ---

const rowToDesign = (row: any): DesignRow => ({
  id: row.id,
  fileName: row.file_name,
  imageUrl: row.image_url,
  storagePath: row.storage_path,
  qikinkSku: row.qikink_sku,
  publishedProductId: row.published_product_id,
  createdAt: row.created_at,
});

export const fetchDesigns = async (): Promise<DesignRow[] | null> => {
  const db = getSupabaseAdmin();
  if (!db) return null;

  try {
    const { data, error } = await db.from('designs').select('*').order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error.message)) {
        throw new SetupRequiredError(
          'The designs table does not exist yet. Run supabase/setup.sql in the Supabase SQL editor.'
        );
      }
      throw new Error(error.message);
    }

    return (data || []).map(rowToDesign);
  } catch (err) {
    if (err instanceof SetupRequiredError) throw err;
    if (isConnectionError(err)) {
      throw new SupabaseUnreachableError();
    }
    throw err;
  }
};

export const insertDesign = async (design: {
  fileName: string;
  imageUrl: string;
  storagePath: string;
  qikinkSku?: string | null;
}): Promise<DesignRow> => {
  const db = getSupabaseAdmin();
  if (!db) throw new Error('Supabase is not configured.');

  try {
    const { data, error } = await db
      .from('designs')
      .insert({
        file_name: design.fileName,
        image_url: design.imageUrl,
        storage_path: design.storagePath,
        qikink_sku: design.qikinkSku || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return rowToDesign(data);
  } catch (err) {
    if (isConnectionError(err)) throw new SupabaseUnreachableError();
    throw err;
  }
};

export const markDesignPublished = async (designId: string, productId: string | null): Promise<void> => {
  const db = getSupabaseAdmin();
  if (!db) throw new Error('Supabase is not configured.');

  try {
    const { error } = await db.from('designs').update({ published_product_id: productId }).eq('id', designId);
    if (error) throw new Error(error.message);
  } catch (err) {
    if (isConnectionError(err)) throw new SupabaseUnreachableError();
    throw err;
  }
};

export const deleteDesignById = async (designId: string): Promise<void> => {
  const db = getSupabaseAdmin();
  if (!db) throw new Error('Supabase is not configured.');

  try {
    const { error } = await db.from('designs').delete().eq('id', designId);
    if (error) throw new Error(error.message);
  } catch (err) {
    if (isConnectionError(err)) throw new SupabaseUnreachableError();
    throw err;
  }
};

// --- Orders ---

export const persistOrder = async (order: any): Promise<void> => {
  const db = getSupabaseAdmin();
  if (!db) return;

  try {
    await db.from('orders').upsert({
      id: order.id,
      tracking_number: order.trackingNumber,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      shipping_address: order.shippingAddress,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping_fee: order.shippingFee,
      total_amount: order.totalAmount,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      razorpay_payment_id: order.razorpayPaymentId || null,
      qikink_order_id: order.qikinkOrderId || null,
      status: order.status,
      estimated_delivery: order.estimatedDelivery,
      courier_name: order.courierName || null,
    });
  } catch (err) {
    console.error('Failed to persist order to Supabase:', err);
  }
};
