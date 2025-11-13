import { NextResponse } from 'next/server';
import { get } from '@/lib/api';

export async function GET() {
  try {
    const response = await get<{ credits: number; dealerId: number }>(
      '/dealers/credits',
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch dealer credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 },
    );
  }
}
