import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { listQikinkOrders, mapQikinkStatus, toQikinkOrderNumber } from '@/lib/qikink-server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Pull the latest print/ship status for every order from Qikink and write it
 * back to Supabase, so /track-order and the admin table stay current without
 * anyone updating statuses by hand.
 *
 * Qikink stores order numbers stripped of special characters (HB89421), while
 * our ids keep the hyphen (HB-89421), so matching is done on the stripped form.
 */
export async function POST() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  try {
    const remote = await listQikinkOrders();

    if (remote.length === 0) {
      return NextResponse.json({
        checked: 0,
        updated: 0,
        updates: [],
        message: 'Qikink has no orders on record yet.',
      });
    }

    const db = getSupabaseAdmin();

    // Map stripped order number -> our real order id.
    const idByStripped = new Map<string, string>();
    if (db) {
      const { data } = await db.from('orders').select('id');
      for (const row of data || []) {
        idByStripped.set(toQikinkOrderNumber(row.id), row.id);
      }
    }

    const updates: { orderId: string; status: string }[] = [];
    const unmatched: string[] = [];

    for (const row of remote) {
      if (!row.orderNumber) continue;

      const status = mapQikinkStatus(row.status);
      if (!status) continue;

      const stripped = toQikinkOrderNumber(row.orderNumber);
      const orderId = idByStripped.get(stripped);

      if (!orderId) {
        unmatched.push(row.orderNumber);
        continue;
      }

      updates.push({ orderId, status });

      if (db) {
        await db
          .from('orders')
          .update({
            status,
            ...(row.trackingNumber ? { tracking_number: row.trackingNumber } : {}),
            ...(row.courierName ? { courier_name: row.courierName } : {}),
            ...(row.qikinkOrderId ? { qikink_order_id: row.qikinkOrderId } : {}),
            qikink_synced_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      }
    }

    const unmatchedNote = unmatched.length
      ? ` ${unmatched.length} Qikink order(s) had no matching local record.`
      : '';

    return NextResponse.json({
      checked: remote.length,
      updated: updates.length,
      updates,
      unmatched,
      message: `Checked ${remote.length} Qikink order(s), updated ${updates.length}.${unmatchedNote}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not reach Qikink.' },
      { status: 502 }
    );
  }
}
