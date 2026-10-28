import React from 'react';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import ProductDetailClient from './ProductDetailClient';

/**
 * The seed products are prerendered for a fast first paint. Products published
 * later from the design library have IDs we cannot know at build time, so
 * dynamicParams lets them render on demand instead of 404ing.
 */
export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((p) => ({ id: p.id }));
}

export const dynamicParams = true;

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient productId={params.id} />;
}
