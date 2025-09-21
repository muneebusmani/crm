"use server";

import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Generic API client that attaches Bearer token automatically
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  skipAuth = false // use true for login/register
) {

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

    if (!skipAuth) {
        const token = (await cookies()).get("token")?.value;
        if (token) {
            (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
