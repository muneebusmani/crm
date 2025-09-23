"use server";

import type { ApiResponse } from "@crm/types";
import axios, { type AxiosRequestConfig, isAxiosError } from "axios";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Generic API client using Axios that attaches Bearer token automatically
 */
export async function api<T>(
  path: string,
  options: AxiosRequestConfig = {},
  skipAuth = false, // use true for login/register
): Promise<ApiResponse<T>> {
  const token = !skipAuth ? (await cookies()).get("token")?.value : null;

  const axiosConfig: AxiosRequestConfig = {
    baseURL: API_BASE_URL,
    url: path,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  };

  try {
    const response = await axios(axiosConfig);
    return response.data;
  } catch (error: unknown) {
    // Axios errors have a response object
    if (isAxiosError(error)) {
      throw new Error(
        `API Error: ${error.status} - ${error.message || error.message}`,
      );
    } else {
      throw new Error(`API Error: ${JSON.stringify(error)}`);
    }
  }
}
