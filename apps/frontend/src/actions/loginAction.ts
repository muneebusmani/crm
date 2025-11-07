// @ts-nocheck
// WARN: DO Not Touch This File
'use server';

import { type Login, type LoginDto, UserType } from '@crm/types';
import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { post2 } from '@/lib/api';

export async function loginAction(_, formData: FormData) {
  try {
    const formdata: LoginDto = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
    // const data = await post2(
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

    // Cookies that JavaScript needs to read (not httpOnly)
    const clientAccessibleOptions = {
      httpOnly: false, // Allow JavaScript to read these cookies
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiry,
      path: '/',
      sameSite: 'lax' as const,
    };

    // Cookies that should be secure and httpOnly (refresh_token)
    const secureOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiry,
      path: '/',
      sameSite: 'lax' as const,
    };

    if (!accessToken) console.error('Token not sent from API');

    console.log(
      '🍪 [Login Action] Setting cookies with options:',
      clientAccessibleOptions,
    );
    console.log(
      '🔑 [Login Action] Access token (first 20 chars):',
      accessToken?.substring(0, 20),
    );

    // Set cookies that need to be accessible to JavaScript
    cookieStore.set('id', id.toString(), clientAccessibleOptions);
    cookieStore.set('user_type', userType, clientAccessibleOptions);
    cookieStore.set('access_token', accessToken, clientAccessibleOptions);

    // Keep refresh_token secure with httpOnly
    cookieStore.set('refresh_token', refreshToken, secureOptions);

    console.log('✅ [Login Action] Cookies set successfully');
    console.log('🍪 [Login Action] Cookie names set:', [
      'id',
      'user_type',
      'access_token',
      'refresh_token',
    ]);

    const redirectMap: Record<UserType, string> = {
      [UserType.ADMIN]: '/admin',
      [UserType.DEALER]: '/dealer',
    };

    const target = redirectMap[userType];
    if (target) {
      return { success: true, target, message: 'Login successful' };
      // redirect(target);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data);
      return { message: error.response?.data };
    } else {
      console.error(error);
      return { message: error };
    }
  }
}
