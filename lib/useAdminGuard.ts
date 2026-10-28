'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from './store';

/**
 * Redirects to the login screen once the server has told us there is no valid
 * admin session. Returns `ready` so pages can render a skeleton instead of
 * flashing their contents while the session is still being checked.
 */
export const useAdminGuard = () => {
  const router = useRouter();
  const { isAdminLoggedIn, adminChecked } = useStore();

  useEffect(() => {
    if (adminChecked && !isAdminLoggedIn) {
      router.replace('/admin/login');
    }
  }, [adminChecked, isAdminLoggedIn, router]);

  return { ready: adminChecked && isAdminLoggedIn, checking: !adminChecked };
};
