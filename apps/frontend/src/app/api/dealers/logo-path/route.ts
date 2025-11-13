'use server';

import { put } from '@/lib/api';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { logoPath } = body;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token');

    if (!accessToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await put('/dealers/profile/logo-path', {
      logoPath,
    });

    return Response.json(response);
  } catch (error) {
    console.error('Error updating logo path:', error);
    return Response.json(
      { error: 'Failed to update logo path' },
      { status: 500 },
    );
  }
}
