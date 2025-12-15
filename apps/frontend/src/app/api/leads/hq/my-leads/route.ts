import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract pagination params from the request
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

    // Build URL with query params
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/leads/hq/my-leads`);
    if (page) url.searchParams.set('page', page);
    if (limit) url.searchParams.set('limit', limit);
    if (search) url.searchParams.set('search', search);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to fetch HQ leads' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data.data || data);
  } catch (error) {
    console.error('Error fetching HQ leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
