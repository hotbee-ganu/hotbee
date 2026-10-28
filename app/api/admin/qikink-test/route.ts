import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import {
  isQikinkConfigured,
  isQikinkSandbox,
  listQikinkOrders,
  triggerSandboxTestOrder,
} from '@/lib/qikink-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  if (!isQikinkConfigured()) {
    return NextResponse.json({
      configured: false,
      sandbox: false,
      count: 0,
      orders: [],
      message: 'Qikink credentials not set.',
    });
  }

  try {
    const orders = await listQikinkOrders();
    return NextResponse.json({
      configured: true,
      sandbox: isQikinkSandbox(),
      count: orders.length,
      orders,
      readyForLive: orders.length >= 3,
      message: `${orders.length} test order(s) found in Qikink sandbox.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to query Qikink orders.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  if (!isQikinkConfigured()) {
    return NextResponse.json({ error: 'Qikink credentials not set.' }, { status: 400 });
  }

  try {
    const result = await triggerSandboxTestOrder();
    const orders = await listQikinkOrders().catch(() => []);

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      message: result.message,
      count: orders.length,
      orders,
      readyForLive: orders.length >= 3,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create sandbox test order.' },
      { status: 500 }
    );
  }
}
