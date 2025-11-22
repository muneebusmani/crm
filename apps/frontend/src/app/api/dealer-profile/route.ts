import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/dealers/profile/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch((e) => {
      console.error('Error Occurred:', JSON.stringify(e));
    });

    // if (!response.ok) {
    //   return NextResponse.json(
    //     { error: 'Failed to fetch dealer info' },
    //     { status: response.status },
    //   );
    // }

    const dealerData = await response.json();
    console.log(`    Response recieved: ${JSON.stringify(dealerData)}`);
    // Return the dealer ID from the dealer object
    return NextResponse.json({
      userId: dealerData.id,
      dealerId: dealerData.dealer?.id || null,
      name: dealerData.name,
      email: dealerData.email,
    });
  } catch (error) {
    console.error('Failed to fetch dealer info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
