/** biome-ignore-all lint/suspicious/noExplicitAny: <abstraction> */
'use server';

import type { ApiResponse } from '@crm/types';
import { cookies } from 'next/headers';
import http, { type RequestConfig } from 'next-axis';

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

// READ METHODS
export async function get<T = any>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return http.get<T>(path, await attachToken(options, skipAuth));
}

export async function del<T = any>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return http.delete<T>(path, await attachToken(options, skipAuth)) as Promise<
    ApiResponse<T>
  >;
}

export async function head<T = any>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return http.head<T>(path, await attachToken(options, skipAuth)) as Promise<
    ApiResponse<T>
  >;
}

export async function options<T = any>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return http.options<T>(path, await attachToken(options, skipAuth)) as Promise<
    ApiResponse<T>
  >;
}

// WRITE METHODS
export async function post<R = any, B = any>(
  path: string,
  body?: B,
  options?: RequestConfig<B>,
  skipAuth = false,
) {
  return http.post<R, B>(
    path,
    body,
    await attachToken(options, skipAuth),
  ) as Promise<ApiResponse<R>>;
}
export async function post2<R = any, B = any>(
  path: string,
  body?: B,
  options?: RequestConfig<B>,
  skipAuth = false,
) {
  return http.post<R, B>(path, body, await attachToken(options, skipAuth));
}

export async function put<R = any, B = any>(
  path: string,
  body?: B,
  options?: RequestConfig<B>,
  skipAuth = false,
) {
  return http.put<R, B>(path, body, await attachToken(options, skipAuth));
}

export async function patch<R = any, B = any>(
  path: string,
  body?: B,
  options?: RequestConfig<B>,
  skipAuth = false,
) {
  return http.patch<R, B>(
    path,
    body,
    await attachToken(options, skipAuth),
  ) as Promise<ApiResponse<R>>;
}
