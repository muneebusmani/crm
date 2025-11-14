/** biome-ignore-all lint/suspicious/noExplicitAny: <abstraction> */
'use server';

import type { ApiResponse } from '@crm/types';
import { cookies } from 'next/headers';
import http, { type RequestConfig } from 'next-axis';
import { refreshAccessToken, clearAuthAndRedirect } from './token-refresh';
import { isUnauthorizedError, isRefreshRequest } from './token-utils';
import { redirect } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error(
    'NEXT_PUBLIC_API_URL not set in the Environment. Either the env is missing or env not present for current Environment.',
  );
}
http.setBaseURL(apiUrl);

async function attachToken<T>(
  options: RequestConfig<T> = {},
  skipAuth = false,
) {
  const token = !skipAuth ? (await cookies()).get('access_token')?.value : null;
  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

/**
 * Wrapper function that handles automatic token refresh on 401 errors
 * @param fn The API function to call
 * @param args The arguments to pass to the API function
 * @returns The result of the API call
 */
async function withTokenRefresh<T>(
  fn: (...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<T> {
  try {
    return await fn(...args);
  } catch (error) {
    // Check if this is a 401 error and not a refresh request
    if (isUnauthorizedError(error) && !isRefreshRequest(args[0] as string)) {
      try {
        // Attempt to refresh the token
        await refreshAccessToken();

        // Retry the original request with the new token (it will be picked up by attachToken)
        return await fn(...args);
      } catch {
        // Refresh failed, clear auth and redirect to login
        await clearAuthAndRedirect();
        redirect('/login');
      }
    }

    // Re-throw the original error if it's not a 401 or refresh failed
    throw error;
  }
}

// READ METHODS
export async function get<T = any>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  console.log(`[API GET] Calling: ${path}`);
  try {
    const result = await withTokenRefresh(
      async () => http.get<T>(path, await attachToken(options, skipAuth)),
      path,
    );
    console.log(`[API GET] Success: ${path}`, result);
    return result;
  } catch (error) {
    console.error(`[API GET] Error: ${path}`, error);
    throw error;
  }
}

export async function del<T = any>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return withTokenRefresh(
    async () =>
      http.delete<T>(path, await attachToken(options, skipAuth)) as Promise<
        ApiResponse<T>
      >,
    path,
  );
}

export async function head<T = any>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return withTokenRefresh(
    async () =>
      http.head<T>(path, await attachToken(options, skipAuth)) as Promise<
        ApiResponse<T>
      >,
    path,
  );
}

export async function options<T = any>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return withTokenRefresh(
    async () =>
      http.options<T>(path, await attachToken(options, skipAuth)) as Promise<
        ApiResponse<T>
      >,
    path,
  );
}

// WRITE METHODS
export async function post<R = any, B = any>(
  path: string,
  body?: B,
  options?: RequestConfig<B>,
  skipAuth = false,
) {
  return withTokenRefresh(
    async () =>
      http.post<R, B>(
        path,
        body,
        await attachToken(options, skipAuth),
      ) as Promise<ApiResponse<R>>,
    path,
  );
}

export async function post2<R = any, B = any>(
  path: string,
  body?: B,
  options?: RequestConfig<B>,
  skipAuth = false,
) {
  return withTokenRefresh(
    async () =>
      http.post<R, B>(path, body, await attachToken(options, skipAuth)),
    path,
  );
}

export async function put<R = any, B = any>(
  path: string,
  body?: B,
  options?: RequestConfig<B>,
  skipAuth = false,
) {
  return withTokenRefresh(
    async () =>
      http.put<R, B>(path, body, await attachToken(options, skipAuth)),
    path,
  );
}

export async function patch<R = any, B = any>(
  path: string,
  body?: B,
  options?: RequestConfig<B>,
  skipAuth = false,
) {
  return withTokenRefresh(
    async () =>
      http.patch<R, B>(
        path,
        body,
        await attachToken(options, skipAuth),
      ) as Promise<ApiResponse<R>>,
    path,
  );
}
