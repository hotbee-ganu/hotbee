import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { SetupRequiredError, deleteProductById, fetchProducts, upsertProduct } from '@/lib/catalog-server';
import { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await fetchProducts();
    // null => Supabase not configured; the client falls back to seed data.
    return NextResponse.json({ products, source: products ? 'supabase' : 'local' });
  } catch (err) {
    // A missing schema is a setup step, not a storefront outage - answer 200 so
    // customers still see the seed catalogue.
    if (err instanceof SetupRequiredError) {
      return NextResponse.json({ products: null, source: 'local', setupRequired: true, error: err.message });
    }
    return NextResponse.json(
      { products: null, source: 'error', error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  try {
    const product = (await request.json()) as Product;
    if (!product?.title || !product?.price) {
      return NextResponse.json({ error: 'Title and price are required.' }, { status: 400 });
    }
    const saved = await upsertProduct(product);
    return NextResponse.json({ product: saved });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not save the product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing product id.' }, { status: 400 });

  try {
    await deleteProductById(id);
    return NextResponse.json({ deleted: id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not delete the product.' },
      { status: 500 }
    );
  }
}
