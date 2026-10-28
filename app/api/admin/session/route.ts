import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  createSessionToken,
  isAdminRequest,
  sessionCookieOptions,
  verifyPin,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ authenticated: isAdminRequest() });
}

export async function POST(request: Request) {
  const { pin } = await request.json().catch(() => ({ pin: '' }));

  if (!verifyPin(pin)) {
    // Small delay to blunt rapid PIN guessing.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ error: 'Incorrect Access PIN.' }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
