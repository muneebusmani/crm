import { NextResponse } from 'next/server';
import { leadsApi } from '@/services/leads.service';

export async function GET() {
  try {
    const data = await leadsApi.getUncontacted();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg =
      e instanceof Error ? e.message : 'Failed to fetch uncontacted leads';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
