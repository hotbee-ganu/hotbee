'use client';

import { useCallback, useEffect, useState } from 'react';

export interface ServiceStatus {
  connected: boolean;
  mode?: string;
  message: string;
}

export interface IntegrationStatus {
  supabase: ServiceStatus;
  qikink: ServiceStatus;
  razorpay: ServiceStatus;
  resend: ServiceStatus;
}

const PENDING: ServiceStatus = { connected: false, message: 'Checking...' };

/**
 * Reads live integration health from /api/status.
 * The checks run server-side because the Qikink and Razorpay secrets are not
 * available to the browser - the old client-side `isXConfigured()` helpers
 * could only ever see the public env vars.
 */
export const useIntegrationStatus = (enabled: boolean) => {
  const [status, setStatus] = useState<IntegrationStatus>({
    supabase: PENDING,
    qikink: PENDING,
    razorpay: PENDING,
    resend: PENDING,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Could not read integration status.');
      } else {
        setStatus(data);
        setError('');
      }
    } catch {
      setError('Network error while checking integrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void refresh();
  }, [enabled, refresh]);

  const allLive =
    status.supabase.connected &&
    status.qikink.connected &&
    status.qikink.mode === 'live' &&
    status.razorpay.connected &&
    status.razorpay.mode === 'live';

  return { status, loading, error, refresh, allLive };
};
