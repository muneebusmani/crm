'use server';

import { UserType } from '@crm/types';
import { cookies } from 'next/headers';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface QueuedRequest {
  resolve: (value: string | null) => void;
  reject: (reason?: Error) => void;
}

// Queue to hold requests while refresh is in progress
let isRefreshing = false;
let refreshQueue: QueuedRequest[] = [];

/**
 * Get cookie expiry based on user type
 */
async function getCookieExpiry(): Promise<number> {
  const cookieStore = await cookies();
  const userTypeCookie = cookieStore.get('user_type')?.value;

  const expiryMap: Record<UserType | 'DEFAULT', number> = {
    [UserType.ADMIN]: 24 * 60 * 60, // 24 hrs
    [UserType.DEALER]: 7 * 24 * 60 * 60, // 7 days
    DEFAULT: 8 * 60 * 60, // 8 hrs
  };

  return expiryMap[userTypeCookie as UserType] ?? expiryMap.DEFAULT;
}

/**
 * Update auth cookies with new tokens and refresh expiry of all session cookies
 */
async function updateAuthCookies(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const cookieStore = await cookies();
  const expiry = await getCookieExpiry();

  const commonOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: expiry,
    path: '/',
    sameSite: 'strict' as const,
  };

  // Update tokens with new values
  cookieStore.set('access_token', accessToken, commonOptions);
  cookieStore.set('refresh_token', refreshToken, commonOptions);

  // Extend expiry of other session cookies by re-setting them with updated maxAge
  const id = cookieStore.get('id')?.value;
  const userType = cookieStore.get('user_type')?.value;
  const selectedProfileId = cookieStore.get('selected_profile_id')?.value;

  if (id) {
    cookieStore.set('id', id, commonOptions);
  }

  if (userType) {
    cookieStore.set('user_type', userType, commonOptions);
  }

  if (selectedProfileId) {
    cookieStore.set('selected_profile_id', selectedProfileId, commonOptions);
  }
}

/**
 * Clear all auth cookies and redirect to login
 */
export async function clearAuthAndRedirect(): Promise<void> {
  const cookieStore = await cookies();

  // Clear all auth-related cookies
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  cookieStore.delete('user_type');
  cookieStore.delete('id');
  cookieStore.delete('selected_profile_id');
}

/**
 * Process queued requests after token refresh
 */
function processQueue(error: Error | null, token: string | null = null): void {
  refreshQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
  });

  refreshQueue = [];
}

/**
 * Refresh the access token using the refresh token
 * Implements request queuing to prevent multiple simultaneous refresh calls
 */
export async function refreshAccessToken(): Promise<string> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    await clearAuthAndRedirect();
    throw new Error('No refresh token available');
  }

  // If already refreshing, queue this request
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      refreshQueue.push({
        resolve: resolve as (value: string | null) => void,
        reject,
      });
    });
  }

  isRefreshing = true;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL not configured');
    }

    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data: RefreshResponse = await response.json();

    // Update cookies with new tokens
    await updateAuthCookies(data.accessToken, data.refreshToken);

    // Process queued requests with the new token
    processQueue(null, data.accessToken);

    return data.accessToken;
  } catch (error) {
    // Clear auth and process queue with error
    await clearAuthAndRedirect();
    processQueue(error as Error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
}
