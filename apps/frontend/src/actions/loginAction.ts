// WARN: DO Not Touch This File
'use server';

import { type Login, type LoginDto, UserType } from '@crm/types';
import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  try {
    const formdata: LoginDto = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
    const response = await axios.post<Login>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      formdata,
    );
    const {
      accessToken: token,
      user: { type: userType, id },
    } = response.data;

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
    if (!token) console.error('Token not sent from API');

    cookieStore.set('token', token, commonOptions);
    cookieStore.set('user_type', userType, commonOptions);
    cookieStore.set('id', id.toString(), commonOptions);

    const redirectMap: Record<UserType, string> = {
      [UserType.ADMIN]: '/admin',
      [UserType.DEALER]: '/dealer',
    };

    const target = redirectMap[userType];
    if (target) {
      redirect(target);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error; // Re-throw redirect errors
    }
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data); // server response error
    } else {
      console.error(error); // other errors
    }
  }
}
