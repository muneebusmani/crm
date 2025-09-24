'use server';

import { type Login, type LoginDto, UserType } from '@crm/types';
import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as api from '@/lib/api';

export async function loginAction(formData: FormData) {
  try {
    const formdata = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
    const data = await api.post<Login, LoginDto>('/auth/login', formdata);
    // console.log('data ===>', data);
    const userType = data?.user.type as UserType;
    const token = data?.accessToken as string;

    // expiry values in seconds (to match cookie maxAge)
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
    cookieStore.set('id', data?.user.id.toString() as string, commonOptions);

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

// 'use server';
//
// import { type Login, type LoginDto, UserType } from '@crm/types';
// import axios from 'axios';
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import * as api from '@/lib/api';
//
// export async function loginAction(formData: FormData) {
//   try {
//     const formdata = {
//       email: formData.get('email') as string,
//       password: formData.get('password') as string,
//     };
//     const res = await axios.post(
//       `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
//       formdata,
//     );
//     const data = res.data;
//     console.log('data ===>', data);
//     const userType = data?.data.type as UserType;
//     const token = data?.accessToken as string;
//
//     // expiry values in seconds (to match cookie maxAge)
//     const expiryMap: Record<UserType | 'DEFAULT', number> = {
//       [UserType.ADMIN]: 24 * 60 * 60, // 24 hrs
//       [UserType.DEALER]: 7 * 24 * 60 * 60, // 7 days
//       DEFAULT: 8 * 60 * 60, // 8 hrs
//     };
//
//     const expiry = expiryMap[userType] ?? expiryMap.DEFAULT;
//
//     const cookieStore = await cookies();
//     const commonOptions = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: expiry,
//       path: '/',
//       sameSite: 'strict' as const,
//     };
//     if (!token) console.error('Token not sent from API');
//
//     cookieStore.set('token', token, commonOptions);
//     cookieStore.set('user_type', userType, commonOptions);
//     cookieStore.set('id', data?.data.id.toString() as string, commonOptions);
//
//     const redirectMap: Record<UserType, string> = {
//       [UserType.ADMIN]: '/admin',
//       [UserType.DEALER]: '/dealer',
//     };
//
//     const target = redirectMap[userType];
//     if (target) {
//       redirect(target);
//     }
//   } catch (error) {
//     if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
//       throw error; // Re-throw redirect errors
//     }
//     if (axios.isAxiosError(error)) {
//       console.error(error.response?.data); // server response error
//     } else {
//       console.error(error); // other errors
//     }
//   }
// }
//
