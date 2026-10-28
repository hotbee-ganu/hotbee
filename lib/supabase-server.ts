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
  const { error } = await db.from('products').select('id', { count: 'exact', head: true });
  if (error) {
    return { connected: false, message: error.message };
  }
  return { connected: true, message: 'Connected to Supabase.' };
};
