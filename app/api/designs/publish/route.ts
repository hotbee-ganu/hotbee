import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { fetchDesigns, markDesignPublished, upsertProduct } from '@/lib/catalog-server';
import { CATEGORY_PRESETS, buildProductFromDesign } from '@/lib/productPresets';

export const dynamic = 'force-dynamic';

/**
 * Turn an uploaded design into a live storefront product.
 * The image URL comes from the stored design - it is never supplied by the
 * client - so the admin only chooses a title, category and price.
 */
export async function POST(request: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { designId, title, category, price, originalPrice, qikinkSku, collection, description } = body || {};

  if (!designId || !title || !price) {
    return NextResponse.json({ error: 'Design, title and price are required.' }, { status: 400 });
  }
  if (category && !CATEGORY_PRESETS[category]) {
    return NextResponse.json({ error: `Unknown category "${category}".` }, { status: 400 });
  }

  try {
    const designs = await fetchDesigns();
    if (!designs) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
    }

    const design = designs.find((d) => d.id === designId);
    if (!design) {
      return NextResponse.json({ error: 'Design not found.' }, { status: 404 });
    }

    const product = buildProductFromDesign({
      imageUrl: design.imageUrl,
      title,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      qikinkSku: qikinkSku || design.qikinkSku || undefined,
      collection,
      description,
    });

    const saved = await upsertProduct(product);
    await markDesignPublished(design.id, saved.id);

    return NextResponse.json({ product: saved });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not publish the design.' },
      { status: 500 }
    );
  }
}
