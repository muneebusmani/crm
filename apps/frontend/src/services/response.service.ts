'use server';

import { ApiResponse } from '@crm/types';

export async function handleResponse<T>(
  promise: Promise<T> | Promise<ApiResponse<T>>,
  allowNoData = false,
  isApiResponse = true
): Promise<T> {
  const result = await promise;
  
  // If the response is in the ApiResponse format
  if (isApiResponse) {
    const apiResult = result as ApiResponse<T>;
    if (!apiResult.success) {
      throw new Error(apiResult.error || 'API request failed');
    }
    if (!allowNoData && (apiResult.data === undefined || apiResult.data === null)) {
      throw new Error('API returned no data');
    }
    return apiResult.data as T;
  }
  
  // If the response is the direct data (not wrapped in ApiResponse)
  return result as T;
}
