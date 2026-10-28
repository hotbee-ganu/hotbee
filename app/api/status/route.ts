import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { qikinkConnectionStatus } from '@/lib/qikink-server';
import { razorpayConnectionStatus } from '@/lib/razorpay-server';
import { supabaseConnectionStatus } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/** Live integration health for the admin dashboard and settings pages. */
export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const [supabase, qikink] = await Promise.all([supabaseConnectionStatus(), qikinkConnectionStatus()]);

  return NextResponse.json({
    supabase,
    qikink,
    razorpay: razorpayConnectionStatus(),
    resend: {
      connected: Boolean(process.env.RESEND_API_KEY),
      message: process.env.RESEND_API_KEY
        ? 'Email notifications are enabled.'
        : 'RESEND_API_KEY is not set - order emails are disabled.',
    },
  });
}
