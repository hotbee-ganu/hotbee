import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the service-role key.
 * Never import this from a Client Component - the key bypasses RLS.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseServerConfigured = Boolean(
  url && serviceKey && !url.includes('your-supabase-project') && !serviceKey.includes('your-supabase')
);

let client: SupabaseClient | null = null;

export const getSupabaseAdmin = (): SupabaseClient | null => {
  if (!isSupabaseServerConfigured) return null;
  if (!client) {
    client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
};

/** Storage bucket holding the designs uploaded through the admin panel. */
export const DESIGN_BUCKET = 'hotbee-designs';

export const supabaseConnectionStatus = async () => {
  const db = getSupabaseAdmin();
  if (!db) {
    return { connected: false, message: 'Supabase URL / service-role key are not set.' };
  }
  try {
    const { error } = await db.from('products').select('id', { count: 'exact', head: true });
    if (error) {
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Connected to Supabase.' };
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('fetch failed') || msg.toLowerCase().includes('enotfound')) {
      return {
        connected: false,
        message: 'Cannot reach Supabase. The project may be paused in your Supabase dashboard (free tier pauses after 7 days of inactivity).',
      };
    }
    return { connected: false, message: msg };
  }
};
