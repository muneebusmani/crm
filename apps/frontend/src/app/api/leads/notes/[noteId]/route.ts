import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { patch, del } from '@/lib/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { noteId: string } },
) {
  try {
    const cookieStore = await cookies();
    const profileId = cookieStore.get('selected_profile_id')?.value;

    if (!profileId) {
      return NextResponse.json(
        { error: 'No profile selected' },
        { status: 400 },
      );
    }

    const noteId = params.noteId;
    const body = await request.json();
    const note = await patch(`/leads/${profileId}/notes/${noteId}`, body);
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { noteId: string } },
) {
  try {
    const cookieStore = await cookies();
    const profileId = cookieStore.get('selected_profile_id')?.value;

    if (!profileId) {
      return NextResponse.json(
        { error: 'No profile selected' },
        { status: 400 },
      );
    }

    const noteId = params.noteId;
    const result = await del(`/leads/${profileId}/notes/${noteId}`);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 },
    );
  }
}
