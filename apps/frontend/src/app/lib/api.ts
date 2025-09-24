// "use server";
/** biome-ignore-all lint/style/noNonNullAssertion: <idk> */
//
// import type { ApiResponse } from "@crm/types";
// import axios, { type AxiosRequestConfig, isAxiosError } from "axios";
// import { cookies } from "next/headers";
//
// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
//
// /**
//  * Generic API client using Axios that attaches Bearer token automatically
//  */
// export async function api<T>(
//   path: string,
//   options: AxiosRequestConfig = {},
//   skipAuth = false, // use true for login/register
// ): Promise<ApiResponse<T>> {
//   const token = !skipAuth ? (await cookies()).get("token")?.value : null;
//
//   const axiosConfig: AxiosRequestConfig = {
//     baseURL: API_BASE_URL,
//     url: path,
//     withCredentials: true,
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//     ...options,
//   };
//
//   try {
//     const response = await axios(axiosConfig);
//     return response.data;
//   } catch (error: unknown) {
//     // Axios errors have a response object
//     if (isAxiosError(error)) {
//       throw new Error(
//         `API Error: ${error.status} - ${error.message || error.message}`,
//       );
//     } else {
//       throw new Error(`API Error: ${JSON.stringify(error)}`);
//     }
//   }
// }
'use server';

import type { ApiResponse } from '@crm/types';
import { cookies } from 'next/headers';
import http, { type Method, type RequestConfig } from 'next-axis';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const METHODS: Method[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
];

/**
 * Generic API client using next-axis that attaches Bearer token automatically
 */
export async function api<T>(
  path: string,
  options: Omit<RequestConfig<T>, 'url' | 'method'> & { method?: Method } = {},
  skipAuth = false, // use true for login/register
): Promise<ApiResponse<T>> {
  const token = !skipAuth ? (await cookies()).get('token')?.value : null;

  const method: Method = (options.method?.toUpperCase() as Method) || 'GET';
  if (!METHODS.includes(method))
    throw new Error(`Unsupported HTTP method: ${method}`);

  const config: RequestConfig<T> = {
    ...options,
    url: `${API_BASE_URL}${path}`,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  try {
    let response: T;
    switch (method) {
      case 'GET':
        response = await http.get<T>(config.url!, config);
        break;
      case 'POST':
        response = await http.post<T>(config.url!, config);
        break;
      case 'PUT':
        response = await http.put<T>(config.url!, config);
        break;
      case 'PATCH':
        response = await http.patch<T>(config.url!, config);
        break;
      case 'DELETE':
        response = await http.delete<T>(config.url!, config);
        break;
      case 'HEAD':
        response = await http.head<T>(config.url!, config);
        break;
      case 'OPTIONS':
        response = await http.options<T>(config.url!, config);
        break;
      default: // GET
        response = await http.get<T>(config.url!, config);
    }

    return response as ApiResponse<T>;
  } catch (error: unknown) {
    const e = error as { response?: { status?: number }; message?: string };
    throw new Error(
      `API Error: ${e?.response?.status || 'Unknown'} - ${e?.message || JSON.stringify(error)}`,
    );
  }
}
