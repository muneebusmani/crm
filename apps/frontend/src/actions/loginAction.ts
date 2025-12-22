// @ts-nocheck
// WARN: DO Not Touch This File
'use server';

import { type Login, type LoginDto, UserType } from '@crm/types';
import { cookies } from 'next/headers';
import { post2 } from '@/lib/api';

// Error code to user-friendly message mapping
const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_SUSPENDED: 'Your account has been suspended by the administrator.',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact support.',
  DEVICE_LIMIT_REACHED:
    'You have reached the maximum number of allowed devices. Please contact support.',
};

export async function loginAction(_, formData: FormData) {
  try {
    const formdata: LoginDto = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      deviceFingerprint: formData.get('deviceFingerprint') as
        | string
        | undefined,
    };

    console.log(
      '[LoginAction] Attempting login with fingerprint:',
      formdata.deviceFingerprint?.substring(0, 16) + '...',
    );

    const {
      user: { type: userType, id },
      accessToken,
      refreshToken,
    } = await post2<Login, LoginDto>(`/auth/login`, formdata);

    const expiryMap: Record<UserType | 'DEFAULT', number> = {
      [UserType.ADMIN]: 24 * 60 * 60, // 24 hrs
      [UserType.DEALER]: 7 * 24 * 60 * 60, // 7 days
      DEFAULT: 8 * 60 * 60, // 8 hrs
    };

    const expiry = expiryMap[userType] ?? expiryMap.DEFAULT;

    const cookieStore = await cookies();
    const commonOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiry,
      path: '/',
      sameSite: 'strict' as const,
    };
    if (!accessToken) console.error('Token not sent from API');

    cookieStore.set('id', id.toString(), commonOptions);
    cookieStore.set('user_type', userType, commonOptions);
    cookieStore.set('access_token', accessToken, commonOptions);
    cookieStore.set('refresh_token', refreshToken, commonOptions);

    const redirectMap: Record<UserType, string> = {
      [UserType.ADMIN]: '/admin',
      [UserType.DEALER]: '/dealer',
    };

    const target = redirectMap[userType];
    if (target) {
      return { success: true, target, message: 'Login successful' };
    }
  } catch (error: unknown) {
    // Handle Next.js redirect errors
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[LoginAction] Login error:', error);

    // Extract error details from various error formats
    let errorCode: string | undefined;
    let message = 'Login failed. Please try again.';
    let statusCode: number | undefined;

    // Handle next-axis errors (they have response data attached)
    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;

      // Try to extract from error.response (axios-style)
      if (err.response && typeof err.response === 'object') {
        const response = err.response as Record<string, unknown>;
        statusCode = response.status as number;
        if (response.data && typeof response.data === 'object') {
          const data = response.data as Record<string, unknown>;
          errorCode = data.errorCode as string;
          message = (data.message as string) || message;
        }
      }
      // Try to extract from error.data directly (next-axis style)
      else if (err.data && typeof err.data === 'object') {
        const data = err.data as Record<string, unknown>;
        errorCode = data.errorCode as string;
        message = (data.message as string) || message;
      }
      // Try to extract from error itself (thrown HttpException format)
      else if (err.errorCode || err.message) {
        errorCode = err.errorCode as string;
        message = (err.message as string) || message;
      }
      // Error might have statusCode directly
      else if (err.statusCode) {
        statusCode = err.statusCode as number;
        message = (err.message as string) || message;
      }
    }

    // If error is a string
    if (typeof error === 'string') {
      message = error;
    }

    // Map error code to user-friendly message
    if (errorCode && errorMessages[errorCode]) {
      message = errorMessages[errorCode];
    }

    console.error('[LoginAction] Parsed error:', {
      errorCode,
      message,
      statusCode,
    });

    return {
      success: false,
      errorCode,
      message,
    };
  }
}
