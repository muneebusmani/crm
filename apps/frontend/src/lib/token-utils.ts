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
 * Check if the request is to an auth endpoint that should skip token refresh logic.
 * This includes:
 * - /auth/refresh (to prevent infinite loops)
 * - /auth/login (login errors should be handled by the action, not redirect)
 * - /auth/register
 */
export function isRefreshRequest(url: string): boolean {
  return (
    url.includes('/auth/refresh') ||
    url.includes('/auth/login') ||
    url.includes('/auth/register')
  );
}
