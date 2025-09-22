"use server";

import axios, { AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Generic API client using Axios that attaches Bearer token automatically
 */
export async function apiFetch(
  path: string,
  options: AxiosRequestConfig = {},
  skipAuth = false // use true for login/register
) {
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
  } catch (error: any) {
    // Axios errors have a response object
    if (error.response) {
      throw new Error(
        `API Error: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    } else {
      throw new Error(`API Error: ${error.message}`);
    }
  }
}
