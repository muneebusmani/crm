/**
 * Utility functions for token management (non-async helpers)
 */

/**
 * Check if an error is a 401 Unauthorized error
 */
export function isUnauthorizedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as Record<string, unknown>;
  const status = err.status as number | undefined;
  const statusCode = err.statusCode as number | undefined;
  const response = err.response as Record<string, unknown> | undefined;

  return Boolean(
    status === 401 ||
      statusCode === 401 ||
      (response && (response.status as number) === 401),
  );
}

/**
 * Check if the request is to the refresh endpoint (to prevent infinite loops)
 */
export function isRefreshRequest(url: string): boolean {
  return url.includes('/auth/refresh');
}
