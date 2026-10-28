import { Order, OrderTimelineStep } from './types';

/**
 * Client-safe Qikink helpers only.
 * All API calls live in lib/qikink-server.ts (server-only) and are reached
 * through /api/orders and /api/orders/sync - the credentials are never shipped
 * to the browser.
 */

export const ORDER_STATUS_LEVEL: Record<Order['status'], number> = {
  placed: 1,
  qikink_submitted: 2,
  printing: 3,
  shipped: 4,
  delivered: 5,
  cancelled: -1,
};

export const ORDER_STATUS_LABEL: Record<Order['status'], string> = {
  placed: 'Placed',
  qikink_submitted: 'Sent to Qikink',
  printing: 'Printing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const generateQikinkTimeline = (order: Order): OrderTimelineStep[] => {
  const currentLevel = ORDER_STATUS_LEVEL[order.status] || 1;

  return [
    {
      status: 'placed',
      label: 'Order Placed & Payment Verified',
      date: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      completed: currentLevel >= 1,
      current: currentLevel === 1,
    },
    {
      status: 'qikink_submitted',
      label: 'Synced with Qikink POD Factory',
      date: currentLevel >= 2 ? 'In Production' : undefined,
      completed: currentLevel >= 2,
      current: currentLevel === 2,
    },
    {
      status: 'printing',
      label: 'DTF Printing & Quality Inspection',
      date: currentLevel >= 3 ? 'Passed QA' : undefined,
      completed: currentLevel >= 3,
      current: currentLevel === 3,
    },
    {
      status: 'shipped',
      label: `Shipped via ${order.courierName || 'Courier Partner'}`,
      date: currentLevel >= 4 ? `Tracking: ${order.trackingNumber}` : undefined,
      completed: currentLevel >= 4,
      current: currentLevel === 4,
    },
    {
      status: 'delivered',
      label: `Delivered (Est: ${order.estimatedDelivery})`,
      date: currentLevel >= 5 ? order.estimatedDelivery : undefined,
      completed: currentLevel >= 5,
      current: currentLevel === 5,
    },
  ];
};
