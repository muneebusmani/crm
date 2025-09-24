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
// 'use server';
//
// import type { ApiResponse } from '@crm/types';
// import { cookies } from 'next/headers';
// import http, { type Method, type RequestConfig } from 'next-axis';
//
// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
//
// const METHODS: Method[] = [
//   'GET',
//   'POST',
//   'PUT',
//   'PATCH',
//   'DELETE',
//   'HEAD',
//   'OPTIONS',
// ];
//
// /**
//  * Generic API client using next-axis that attaches Bearer token automatically
//  */
// export async function api<T>(
//   path: string,
//   options: Omit<RequestConfig<T>, 'url' | 'method'> & { method?: Method } = {},
//   skipAuth = false, // use true for login/register
// ): Promise<ApiResponse<T>> {
//   const token = !skipAuth ? (await cookies()).get('token')?.value : null;
//
//   const method: Method = (options.method?.toUpperCase() as Method) || 'GET';
//   if (!METHODS.includes(method))
//     throw new Error(`Unsupported HTTP method: ${method}`);
//
//   const config: RequestConfig<T> = {
//     ...options,
//     url: `${API_BASE_URL}${path}`,
//     method,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(options.headers || {}),
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//   };
//
//   try {
//     let response: T;
//     switch (method) {
//       case 'GET':
//         response = await http.get<T>(config.url!, config);
//         break;
//       case 'POST':
//         response = await http.post<T>(config.url!, config);
//         break;
//       case 'PUT':
//         response = await http.put<T>(config.url!, config);
//         break;
//       case 'PATCH':
//         response = await http.patch<T>(config.url!, config);
//         break;
//       case 'DELETE':
//         response = await http.delete<T>(config.url!, config);
//         break;
//       case 'HEAD':
//         response = await http.head<T>(config.url!, config);
//         break;
//       case 'OPTIONS':
//         response = await http.options<T>(config.url!, config);
//         break;
//       default: // GET
//         response = await http.get<T>(config.url!, config);
//     }
//
//     return response as ApiResponse<T>;
//   } catch (error: unknown) {
//     const e = error as { response?: { status?: number }; message?: string };
//     throw new Error(
//       `API Error: ${e?.response?.status || 'Unknown'} - ${e?.message || JSON.stringify(error)}`,
//     );
//   }
// }
// 'use server';
//
// import type { ApiResponse } from '@crm/types';
// import { cookies } from 'next/headers';
// import http, { type RequestConfig } from 'next-axis';
//
// // Set global base URL once
// http.setBaseURL(process.env.NEXT_PUBLIC_API_URL!);
//
// async function attachToken<T>(
//   options: RequestConfig<T> = {},
//   skipAuth = false,
// ) {
//   const token = !skipAuth ? (await cookies()).get('token')?.value : null;
//   return {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(options.headers || {}),
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//   };
// }
//
// export const api = {
//   get: async <T>(path: string, options?: RequestConfig<T>, skipAuth = false) =>
//     http.get<T>(path, await attachToken(options, skipAuth)) as Promise<
//       ApiResponse<T>
//     >,
//
//   post: async <T>(path: string, options?: RequestConfig<T>, skipAuth = false) =>
//     http.post<T>(path, await attachToken(options, skipAuth)) as Promise<
//       ApiResponse<T>
//     >,
//
//   put: async <T>(path: string, options?: RequestConfig<T>, skipAuth = false) =>
//     http.put<T>(path, await attachToken(options, skipAuth)) as Promise<
//       ApiResponse<T>
//     >,
//
//   patch: async <T>(
//     path: string,
//     options?: RequestConfig<T>,
//     skipAuth = false,
//   ) =>
//     http.patch<T>(path, await attachToken(options, skipAuth)) as Promise<
//       ApiResponse<T>
//     >,
//
//   delete: async <T>(
//     path: string,
//     options?: RequestConfig<T>,
//     skipAuth = false,
//   ) =>
//     http.delete<T>(path, await attachToken(options, skipAuth)) as Promise<
//       ApiResponse<T>
//     >,
//
//   head: async <T>(path: string, options?: RequestConfig<T>, skipAuth = false) =>
//     http.head<T>(path, await attachToken(options, skipAuth)) as Promise<
//       ApiResponse<T>
//     >,
//
//   options: async <T>(
//     path: string,
//     options?: RequestConfig<T>,
//     skipAuth = false,
//   ) =>
//     http.options<T>(path, await attachToken(options, skipAuth)) as Promise<
//       ApiResponse<T>
//     >,
// };
// 'use server';
//
// import type { ApiResponse } from '@crm/types';
// import { cookies } from 'next/headers';
// import http, { type RequestConfig } from 'next-axis';
//
// // Set global base URL
// http.setBaseURL(process.env.NEXT_PUBLIC_API_URL!);
//
// async function attachToken<T>(
//   options: RequestConfig<T> = {},
//   skipAuth = false,
// ) {
//   const token = !skipAuth ? (await cookies()).get('token')?.value : null;
//   return {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(options.headers || {}),
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//   };
// }
//
// export async function get<T>(
//   path: string,
//   options?: RequestConfig<T>,
//   skipAuth = false,
// ) {
//   return http.get<T>(path, await attachToken(options, skipAuth)) as Promise<
//     ApiResponse<T>
//   >;
// }
//
// // export async function post<T>(
// //   path: string,
// //   options?: RequestConfig<T>,
// //   skipAuth = false,
// // ) {
// //   return http.post<T>(path, await attachToken(options, skipAuth)) as Promise<
// //     ApiResponse<T>
// //   >;
// // }
// //
// // export async function put<T>(
// //   path: string,
// //   options?: RequestConfig<T>,
// //   skipAuth = false,
// // ) {
// //   return http.put<T>(path, await attachToken(options, skipAuth)) as Promise<
// //     ApiResponse<T>
// //   >;
// // }
// //
// // export async function patch<T>(
// //   path: string,
// //   options?: RequestConfig<T>,
// //   skipAuth = false,
// // ) {
// //   return http.patch<T>(path, await attachToken(options, skipAuth)) as Promise<
// //     ApiResponse<T>
// //   >;
// // }
// export async function post<R, B>(path: string, data: B, skipAuth = false) {
//   return http.post<R, B>(path, data, {
//     ...(await attachToken({}, skipAuth)),
//   }) as Promise<ApiResponse<R>>;
// }
//
// export async function put<R, B>(path: string, data: B, skipAuth = false) {
//   return http.put<R, B>(path, data, {
//     ...(await attachToken({}, skipAuth)),
//   }) as Promise<ApiResponse<R>>;
// }
//
// export async function patch<R, B>(path: string, data?: B, skipAuth = false) {
//   return http.patch<R, B>(path, data, {
//     ...(await attachToken({}, skipAuth)),
//   }) as Promise<ApiResponse<R>>;
// }
//
// export async function del<T>(
//   path: string,
//   options?: RequestConfig<T>,
//   skipAuth = false,
// ) {
//   return http.delete<T>(path, await attachToken(options, skipAuth)) as Promise<
//     ApiResponse<T>
//   >;
// }
//
// export async function head<T>(
//   path: string,
//   options?: RequestConfig<T>,
//   skipAuth = false,
// ) {
//   return http.head<T>(path, await attachToken(options, skipAuth)) as Promise<
//     ApiResponse<T>
//   >;
// }
//
// export async function options<T>(
//   path: string,
//   options?: RequestConfig<T>,
//   skipAuth = false,
// ) {
//   return http.options<T>(path, await attachToken(options, skipAuth)) as Promise<
//     ApiResponse<T>
//   >;
// }
'use server';

import type { ApiResponse } from '@crm/types';
import { cookies } from 'next/headers';
import http, { type RequestConfig } from 'next-axis';

http.setBaseURL(process.env.NEXT_PUBLIC_API_URL!);

async function attachToken<T>(
  options: RequestConfig<T> = {},
  skipAuth = false,
) {
  const token = !skipAuth ? (await cookies()).get('token')?.value : null;
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
export async function get<T>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return http.get<T>(path, await attachToken(options, skipAuth)) as Promise<
    ApiResponse<T>
  >;
}

export async function del<T>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return http.delete<T>(path, await attachToken(options, skipAuth)) as Promise<
    ApiResponse<T>
  >;
}

export async function head<T>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return http.head<T>(path, await attachToken(options, skipAuth)) as Promise<
    ApiResponse<T>
  >;
}

export async function options<T>(
  path: string,
  options?: RequestConfig<T>,
  skipAuth = false,
) {
  return http.options<T>(path, await attachToken(options, skipAuth)) as Promise<
    ApiResponse<T>
  >;
}

// WRITE METHODS
export async function post<R, B>(
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

export async function put<R, B>(
  path: string,
  body?: B,
  options?: RequestConfig<B>,
  skipAuth = false,
) {
  return http.put<R, B>(
    path,
    body,
    await attachToken(options, skipAuth),
  ) as Promise<ApiResponse<R>>;
}

export async function patch<R, B>(
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
