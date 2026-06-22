import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${backendUrl}/admin/invoices/${id}/preview`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: 'no-store',
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Admin invoice preview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
