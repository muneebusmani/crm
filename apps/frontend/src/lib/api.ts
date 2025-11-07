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
    console.log(
      '🔍 [Frontend API] Extracting token from client-side cookies...',
    );
    const allCookies = document.cookie;
    console.log('🍪 [Frontend API] All cookies:', allCookies);

    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('access_token='))
      ?.split('=')[1];

    if (cookieValue) {
      console.log(
        '✅ [Frontend API] Token found in cookies:',
        cookieValue.substring(0, 20) + '...',
      );
    } else {
      console.log('❌ [Frontend API] No access_token cookie found in client');
    }

    return cookieValue || null;
  } else {
    // Server side - use next/headers
    try {
      console.log(
        '🔍 [Frontend API] Extracting token from server-side cookies...',
      );
      const { cookies } = require('next/headers');
      const token = cookies().get('access_token')?.value || null;

      if (token) {
        console.log(
          '✅ [Frontend API] Token found in server cookies:',
          token.substring(0, 20) + '...',
        );
      } else {
        console.log('❌ [Frontend API] No access_token cookie found on server');
      }

      return token;
    } catch (e) {
      console.log('❌ [Frontend API] Error reading server cookies:', e);
      // In case we're not in a server component context
      return null;
    }
  }
}

async function attachToken(skipAuth = false) {
  const token = !skipAuth ? getAccessToken() : null;

  console.log(
    '🔑 [Frontend API] Attaching token to request. skipAuth:',
    skipAuth,
    'token present:',
    !!token,
  );

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Read METHODS
export async function get<T = any>(path: string, skipAuth = false) {
  const headers = await attachToken(skipAuth);
  console.log('📡 [Frontend API] GET request to:', `${apiUrl}${path}`);
  console.log('🔑 [Frontend API] Headers:', headers);

  const response = await fetch(`${apiUrl}${path}`, {
    method: 'GET',
    headers,
    credentials: 'include', // Important: send cookies
  });

  console.log('📥 [Frontend API] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Frontend API] Request failed:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function del<T = any>(path: string, skipAuth = false) {
  const headers = await attachToken(skipAuth);
  console.log('📡 [Frontend API] DELETE request to:', `${apiUrl}${path}`);

  const response = await fetch(`${apiUrl}${path}`, {
    method: 'DELETE',
    headers,
    credentials: 'include', // Important: send cookies
  });

  console.log('📥 [Frontend API] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Frontend API] Request failed:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`,
    );
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
  console.log('📡 [Frontend API] POST request to:', `${apiUrl}${path}`);

  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Important: send cookies
  });

  console.log('📥 [Frontend API] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Frontend API] Request failed:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`,
    );
  }

  return response.json() as Promise<ApiResponse<R>>;
}

export async function post2<R = any, B = any>(
  path: string,
  body?: B,
  skipAuth = false,
) {
  const headers = await attachToken(skipAuth);
  console.log('📡 [Frontend API] POST2 request to:', `${apiUrl}${path}`);

  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Important: send cookies
  });

  console.log('📥 [Frontend API] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Frontend API] Request failed:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`,
    );
  }

  return response.json() as Promise<R>;
}

// Special POST method for text/HTML responses (like preview endpoints)
export async function postText<B = any>(
  path: string,
  body?: B,
  skipAuth = false,
): Promise<string> {
  const headers = await attachToken(skipAuth);
  console.log('📡 [Frontend API] POST (text) request to:', `${apiUrl}${path}`);

  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Important: send cookies
  });

  console.log('📥 [Frontend API] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Frontend API] Request failed:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`,
    );
  }

  return response.text();
}

export async function put<R = any, B = any>(
  path: string,
  body?: B,
  skipAuth = false,
) {
  const headers = await attachToken(skipAuth);
  console.log('📡 [Frontend API] PUT request to:', `${apiUrl}${path}`);

  const response = await fetch(`${apiUrl}${path}`, {
    method: 'PUT',
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Important: send cookies
  });

  console.log('📥 [Frontend API] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Frontend API] Request failed:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`,
    );
  }

  return response.json() as Promise<ApiResponse<R>>;
}

export async function patch<R = any, B = any>(
  path: string,
  body?: B,
  skipAuth = false,
) {
  const headers = await attachToken(skipAuth);
  console.log('📡 [Frontend API] PATCH request to:', `${apiUrl}${path}`);

  const response = await fetch(`${apiUrl}${path}`, {
    method: 'PATCH',
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Important: send cookies
  });

  console.log('📥 [Frontend API] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Frontend API] Request failed:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`,
    );
  }

  return response.json() as Promise<ApiResponse<R>>;
}
