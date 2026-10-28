import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * Admin sessions are signed cookies issued server-side. The PIN never reaches
 * the browser bundle, and setting a localStorage flag no longer grants access.
 */

export const ADMIN_COOKIE = 'hotbee_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const getSecret = () =>
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'hotbee-dev-only-secret-change-me';

const getPin = () => process.env.ADMIN_PIN || '1234';

const sign = (payload: string) =>
  crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');

export const verifyPin = (pin: string): boolean => {
  const expected = getPin();
  const a = Buffer.from(String(pin ?? ''));
  const b = Buffer.from(expected);
  // Compare lengths separately; timingSafeEqual throws on a length mismatch.
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

export const createSessionToken = (): string => {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
};

export const isValidSessionToken = (token: string | undefined): boolean => {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
};

/** Read the admin session from the incoming request cookies. */
export const isAdminRequest = (): boolean => {
  try {
    return isValidSessionToken(cookies().get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
};

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_MS / 1000,
};
