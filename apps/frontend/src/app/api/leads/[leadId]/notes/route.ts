import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { get, post } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const leadId = params.leadId;
    const notes = await get(`/leads/${leadId}/notes`);
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const cookieStore = await cookies();
    const profileId = cookieStore.get('selected_profile_id')?.value;
    
    if (!profileId) {
      return NextResponse.json(
        { error: 'No profile selected' },
        { status: 400 }
      );
    }

    const leadId = params.leadId;
    const body = await request.json();
    const note = await post(`/leads/${leadId}/${profileId}/notes`, body);
    return NextResponse.json(note);
  } catch ( error )
  {
    console.log(JSON.stringify(error));
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
