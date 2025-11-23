import { NextRequest, NextResponse } from 'next/server';
import { post, put, del } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await post('/company-users', body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const result = await put(`/company-users/${params.id}`, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await del(`/company-users/${params.id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 },
    );
  }
}
