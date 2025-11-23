import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const id = cookieStore.get('selected_profile_id')?.value;
  const name = cookieStore.get('selected_profile_name')?.value;
  const email = cookieStore.get('selected_profile_email')?.value;

  if (!id || !name) {
    return NextResponse.json({ selected: false }, { status: 404 });
  }

  return NextResponse.json({ selected: true, id: Number(id), name, email });
}
