import React from 'react';
import OrderConfirmationClient from './OrderConfirmationClient';

/**
 * Order IDs are generated per purchase, so there is nothing useful to
 * prerender here - every visit is rendered on demand.
 */
export const dynamic = 'force-dynamic';

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  return <OrderConfirmationClient orderId={params.id} />;
}
