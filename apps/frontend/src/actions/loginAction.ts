// @ts-nocheck
// WARN: DO Not Touch This File
'use server';

import { type Login, type LoginDto, UserType } from '@crm/types';
import { cookies, headers } from 'next/headers';

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

    // Get client headers to forward to backend
    const headersList = await headers();
    const clientUserAgent = headersList.get('user-agent') || '';
    const clientIp =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      headersList.get('cf-connecting-ip') || // Cloudflare
      '';

    console.log('[LoginAction] Attempting login:', {
      fingerprint: formdata.deviceFingerprint?.substring(0, 16) + '...',
      clientUserAgent: clientUserAgent.substring(0, 50) + '...',
      clientIp,
    });

    // Make direct fetch call to forward headers properly
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': clientUserAgent,
        'X-Forwarded-For': clientIp,
        'X-Real-IP': clientIp,
      },
      body: JSON.stringify(formdata),
    });

    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      console.error('[LoginAction] API error response:', {
        status: response.status,
        data,
      });

      const errorCode = data.errorCode;
      const message =
        errorMessages[errorCode] ||
        data.message ||
        'Login failed. Please try again.';

      return {
        success: false,
        errorCode,
        message,
      };
    }

    // Success - extract user data
    const { user, accessToken, refreshToken } = data as Login;
    const userType = user.type;
    const id = user.id;

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
    cookieStore.set('user_id', id.toString(), commonOptions);
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

    return { success: false, message: 'Unknown user type' };
  } catch (error: unknown) {
    // Handle Next.js redirect errors
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('[LoginAction] Unexpected error:', error);

    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
}
