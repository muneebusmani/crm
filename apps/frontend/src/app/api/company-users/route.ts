import { NextRequest, NextResponse } from 'next/server';
import { get, post } from '@/lib/api';

export async function GET() {
  try {
    const profiles = await get('/company-users');
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Failed to fetch profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await post('/company-users', body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
