import { NextResponse } from 'next/server';
import { leadMessagesApi } from '@/services/lead-messages.service';

export async function GET() {
  try {
    const data = await leadMessagesApi.getAll();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg =
      e instanceof Error ? e.message : 'Failed to fetch lead messages';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await leadMessagesApi.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const msg =
      e instanceof Error ? e.message : 'Failed to create lead message';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
