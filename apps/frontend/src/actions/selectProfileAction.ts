'use server';

import { cookies } from 'next/headers';
import { get } from '@/lib/api';
import type { CompanyUser } from '@crm/types';

export async function selectProfileAction(profileId: number) {
  try {
    // Call the backend to verify profile ownership and get profile data
    const response = await get<CompanyUser>(
      `/company-users/select/${profileId}`,
    );

    if (!response) {
      return { success: false, message: 'Failed to select profile' };
    }

    // Store selected profile in cookie
    const cookieStore = await cookies();
    // Make profile cookies accessible to JavaScript (not httpOnly)
    // so they can be read on the client side
    const profileOptions = {
      httpOnly: false, // Allow JavaScript to read these cookies
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days - same as dealer session
      path: '/',
      sameSite: 'lax' as const, // Changed from strict to lax for better compatibility
    };

    cookieStore.set(
      'selected_profile_id',
      profileId.toString(),
      profileOptions,
    );
    cookieStore.set('selected_profile_name', response.name, profileOptions);
    cookieStore.set('selected_profile_email', response.email, profileOptions);

    return {
      success: true,
      message: 'Profile selected successfully',
      profile: response,
    };
  } catch (error) {
    console.error('Profile selection error:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to select profile',
    };
  }
}
