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

/**
 * Check if an error indicates the device has been revoked.
 * This triggers forced logout.
 */
export function isDeviceRevokedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as Record<string, unknown>;

  // Check direct errorCode
  if (err.errorCode === 'DEVICE_REVOKED') return true;

  // Check nested response
  const response = err.response as Record<string, unknown> | undefined;
  if (response?.errorCode === 'DEVICE_REVOKED') return true;

  // Check data.errorCode (common Axios format)
  const data = err.data as Record<string, unknown> | undefined;
  if (data?.errorCode === 'DEVICE_REVOKED') return true;

  return false;
}

/**
 * Extract error code from API error response
 */
export function getErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;

  const err = error as Record<string, unknown>;

  // Direct errorCode
  if (typeof err.errorCode === 'string') return err.errorCode;

  // Nested response.errorCode
  const response = err.response as Record<string, unknown> | undefined;
  if (response && typeof response.errorCode === 'string') {
    return response.errorCode;
  }

  // Nested data.errorCode
  const data = err.data as Record<string, unknown> | undefined;
  if (data && typeof data.errorCode === 'string') {
    return data.errorCode;
  }

  return null;
}
