'use client';

import { disconnectDeviceSocket } from '@/contexts/DeviceSocketContext';

/**
 * Force logout utility for client-side logout.
 * Clears all auth state and redirects to login page.
 */

// Keep track of logout in progress to avoid multiple redirects
let logoutInProgress = false;

/**
 * Clear all authentication state and redirect to login.
 * Use this when a device is revoked or session becomes invalid.
 *
 * @param reason - Reason code for the logout (used in URL query param)
 */
export async function forceLogout(
  reason: string = 'session_expired',
): Promise<void> {
  // Prevent multiple logout attempts
  if (logoutInProgress) {
    console.log('[ForceLogout] Logout already in progress, skipping');
    return;
  }
  logoutInProgress = true;

  console.log('[ForceLogout] Starting logout, reason:', reason);

  if (typeof window !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem('deviceFingerprint');
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear client-readable cookies by setting expired date
    // Note: httpOnly cookies will be cleared by the server-side logout endpoint
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const name = cookie.split('=')[0].trim();
      // Clear for all paths - using assignment is intentional for cookie deletion
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    }

    // Call server-side logout endpoint to clear httpOnly cookies
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn(
        '[ForceLogout] Server logout failed, continuing with redirect:',
        e,
      );
    }

    // Disconnect WebSocket
    disconnectDeviceSocket();

    // Redirect to login with reason
    console.log('[ForceLogout] Redirecting to login');
    window.location.href = `/login?reason=${encodeURIComponent(reason)}`;
  }
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get device fingerprint from localStorage
 */
export function getStoredFingerprint(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem('deviceFingerprint');
}

/**
 * Store device fingerprint in localStorage
 */
export function setStoredFingerprint(fingerprint: string): void {
  if (isBrowser()) {
    localStorage.setItem('deviceFingerprint', fingerprint);
  }
}
