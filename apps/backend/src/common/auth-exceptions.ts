import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

/**
 * Thrown when email or password is incorrect.
 * HTTP 401 Unauthorized
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      errorCode: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    });
  }
}

/**
 * Thrown when user account has been suspended by admin.
 * HTTP 403 Forbidden
 */
export class AccountSuspendedException extends ForbiddenException {
  constructor() {
    super({
      errorCode: 'ACCOUNT_SUSPENDED',
      message: 'Your account has been suspended by the administrator.',
    });
  }
}

/**
 * Thrown when user account is inactive.
 * HTTP 403 Forbidden
 */
export class AccountInactiveException extends ForbiddenException {
  constructor() {
    super({
      errorCode: 'ACCOUNT_INACTIVE',
      message: 'Your account is inactive. Please contact support.',
    });
  }
}

/**
 * Thrown when device login limit is reached.
 * HTTP 403 Forbidden
 */
export class DeviceLimitReachedException extends ForbiddenException {
  constructor() {
    super({
      errorCode: 'DEVICE_LIMIT_REACHED',
      message:
        'You have reached the maximum number of allowed devices. Please contact support.',
    });
  }
}

/**
 * Thrown when a device has been revoked by admin.
 * HTTP 403 Forbidden
 */
export class DeviceRevokedException extends ForbiddenException {
  constructor() {
    super({
      errorCode: 'DEVICE_REVOKED',
      message: 'This device has been revoked. Please log in again.',
    });
  }
}
