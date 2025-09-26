import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const id = req.cookies.get('id')?.value;
  const userTypeCookie = req.cookies.get('user_type')?.value;
  const userType = userTypeCookie ? `/${userTypeCookie}` : null;
  const { pathname } = req.nextUrl;

  const publicRoutes = ['/login', '/register', '/forgot-password'];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (token && userType) {
      return NextResponse.redirect(new URL(userType, req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (pathname === '/') {
    if (token && userType) {
      return NextResponse.redirect(new URL(userType, req.nextUrl.origin));
    }
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  }

  // For all other routes (private)
  if (!token)
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));

  if (!userTypeCookie)
    throw new Error(
      'User type cookie not found. Please check your browser settings.',
    );
  if (!id)
    throw new Error('User Id not Found. Please check your browser settings.');

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/dealer/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
