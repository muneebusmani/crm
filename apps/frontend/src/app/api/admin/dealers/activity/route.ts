import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type DealerProfilePayload = {
  id: number;
  email: string;
  name: string;
  logo: string | null;
  lastLoginAt: string | null;
  isConnectedNow: boolean;
  activeDeviceCount: number;
};

type DealerUser = {
  id: number;
  email: string;
  dealer?: {
    name?: string;
    logo?: string | null;
  } | null;
  type?: string;
};

type DealerDevice = {
  isActive: boolean;
  lastLoginAt: string | null;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dealersResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dealers`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (!dealersResponse.ok) {
      const error = await dealersResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.message || 'Failed to fetch dealers' },
        { status: dealersResponse.status },
      );
    }

    const dealers = (await dealersResponse.json()) as DealerUser[];
    const dealerUsers = dealers.filter((user) => Boolean(user.dealer));

    const dealerProfiles = await Promise.all(
      dealerUsers.map(async (user) => {
        const devicesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admins/dealer/${user.id}/devices`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          },
        );

        const devices: DealerDevice[] = devicesResponse.ok
          ? (await devicesResponse.json()).data || []
          : [];

        const presenceResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admins/dealer/${user.id}/presence`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          },
        );

        const presence = presenceResponse.ok
          ? ((await presenceResponse.json()).data?.isConnected ?? false)
          : false;

        const lastLoginAt =
          devices
            .map((device) => device.lastLoginAt)
            .filter((value): value is string => Boolean(value))
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ||
          null;

        return {
          id: user.id,
          email: user.email,
          name: user.dealer?.name || user.email,
          logo: user.dealer?.logo || null,
          lastLoginAt,
          isConnectedNow: presence,
          activeDeviceCount: devices.filter((device) => device.isActive).length,
        } satisfies DealerProfilePayload;
      }),
    );

    return NextResponse.json({
      data: dealerProfiles,
    });
  } catch (error) {
    console.error('Error fetching dealer activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
