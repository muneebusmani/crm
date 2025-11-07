/** biome-ignore-all lint/suspicious/noExplicitAny: <abstraction> */
import type { ApiResponse } from '@crm/types';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error(
    'NEXT_PUBLIC_API_URL not set in the Environment. Either the env is missing or env not present for current Environment.',
  );
}

// Function to get token from cookies - works for both server and client
function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    // Client side
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];
    return cookieValue || null;
  } else {
    // Server side - use next/headers
    try {
      const { cookies } = require('next/headers');
      return cookies().get('access_token')?.value || null;
    } catch (e) {
      // In case we're not in a server component context
      return null;
    }
  }
}

async function attachToken(
  skipAuth = false,
) {
  const token = !skipAuth ? getAccessToken() : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Read METHODS
export async function get<T = any>(path: string, skipAuth = false) {
  const headers = await attachToken(skipAuth);
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export async function del<T = any>(path: string, skipAuth = false) {
  const headers = await attachToken(skipAuth);
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response.json() as Promise<ApiResponse<T>>;
}

// Write METHODS
export async function post<R = any, B = any>(
  path: string,
  body?: B,
  skipAuth = false,
) {
  const headers = await attachToken(skipAuth);
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response.json() as Promise<ApiResponse<R>>;
}

export async function post2<R = any, B = any>(
  path: string,
  body?: B,
  skipAuth = false,
) {
  const headers = await attachToken(skipAuth);
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response.json() as Promise<R>;
}

export async function put<R = any, B = any>(
  path: string,
  body?: B,
  skipAuth = false,
) {
  const headers = await attachToken(skipAuth);
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'PUT',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response.json() as Promise<ApiResponse<R>>;
}

export async function patch<R = any, B = any>(
  path: string,
  body?: B,
  skipAuth = false,
) {
  const headers = await attachToken(skipAuth);
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'PATCH',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response.json() as Promise<ApiResponse<R>>;
}
