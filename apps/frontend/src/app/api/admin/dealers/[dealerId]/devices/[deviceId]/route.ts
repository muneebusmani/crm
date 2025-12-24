import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * DELETE - Remove device permanently (frees slot)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dealerId: string; deviceId: string }> },
) {
  try {
    const { dealerId, deviceId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${API_URL}/admins/dealer/${dealerId}/devices/${deviceId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(error, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing device:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * PATCH - Revoke or reactivate device
 * Body: { action: 'revoke' | 'reactivate' }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ dealerId: string; deviceId: string }> },
) {
  try {
    const { dealerId, deviceId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action as 'revoke' | 'reactivate';

    if (!action || !['revoke', 'reactivate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "revoke" or "reactivate"' },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${API_URL}/admins/dealer/${dealerId}/devices/${deviceId}/${action}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json().catch(() => ({ success: true }));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
