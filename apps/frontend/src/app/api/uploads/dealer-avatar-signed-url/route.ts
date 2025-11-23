'use server';

import { post } from '@/lib/api';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, contentType } = body;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token');

    if (!accessToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await post<{
      success: boolean;
      data: {
        uploadUrl: string;
        token: string;
        path: string;
        fullPath: string;
      };
    }>('/uploads/dealer-avatar-signed-url', {
      fileName,
      contentType,
    });

    return Response.json(response);
  } catch (error) {
    console.error('Error creating signed upload URL:', error);
    return Response.json(
      { error: 'Failed to create upload URL' },
      { status: 500 },
    );
  }
}
