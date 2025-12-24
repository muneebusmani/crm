import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Server-side logout endpoint.
 * Clears httpOnly authentication cookies that cannot be cleared client-side.
 */
export async function POST() {
  const cookieStore = await cookies();

  // List of auth cookies to clear
  const authCookies = [
    'access_token',
    'refresh_token',
    'id',
    'user_id',
    'user_type',
    'selected_profile_id',
    'selected_profile_name',
    'selected_profile_email',
  ];

  // Clear each cookie
  for (const name of authCookies) {
    cookieStore.set(name, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      path: '/',
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}
