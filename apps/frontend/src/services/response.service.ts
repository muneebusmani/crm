'use server';

import { ApiResponse } from '@crm/types';

export async function handleResponse<T>(
  promise: Promise<ApiResponse<T>>,
  allowNoData = false,
): Promise<T> {
  const result = await promise;
  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }
  if (!allowNoData && (result.data === undefined || result.data === null)) {
    throw new Error('API returned no data');
  }
  return result.data as T;
}
