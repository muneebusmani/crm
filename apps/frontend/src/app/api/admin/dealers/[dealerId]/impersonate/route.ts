import { UserType } from '@crm/types';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ dealerId: string }> },
) {
    try {
        const { dealerId } = await params;
        const cookieStore = await cookies();
        const adminToken = cookieStore.get('access_token')?.value;

        if (!adminToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${API_URL}/admins/dealer/${dealerId}/impersonate`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            return NextResponse.json(payload, { status: response.status });
        }

        const sessionData = payload?.data || payload;
        const user = sessionData?.user;
        const accessToken = sessionData?.accessToken;
        const refreshToken = sessionData?.refreshToken;

        if (!user || !accessToken || !refreshToken) {
            return NextResponse.json(
                { error: 'Invalid impersonation response' },
                { status: 500 },
            );
        }

        const expiryMap: Record<UserType | 'DEFAULT', number> = {
            [UserType.ADMIN]: 24 * 60 * 60,
            [UserType.DEALER]: 7 * 24 * 60 * 60,
            DEFAULT: 8 * 60 * 60,
        };

        const userType = user.type as UserType;
        const expiry = expiryMap[userType] ?? expiryMap.DEFAULT;

        const commonOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: expiry,
            path: '/',
            sameSite: 'strict' as const,
        };

        cookieStore.set('id', String(user.id), commonOptions);
        cookieStore.set('user_id', String(user.id), commonOptions);
        cookieStore.set('user_type', userType, commonOptions);
        cookieStore.set('access_token', accessToken, commonOptions);
        cookieStore.set('refresh_token', refreshToken, commonOptions);

        // Ensure dealer chooses/refreshes profile context after impersonation.
        cookieStore.delete('selected_profile_id');
        cookieStore.delete('selected_profile_name');
        cookieStore.delete('selected_profile_email');

        return NextResponse.json({
            success: true,
            target: '/dealer',
        });
    } catch (error) {
        console.error('Error impersonating dealer:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
