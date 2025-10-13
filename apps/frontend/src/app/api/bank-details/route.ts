import { NextResponse } from 'next/server';
import { get } from '@/lib/api';

export async function GET() {
  try {
    const resp = await get('/bank-details');
    const anyResp = resp as any;
    if (anyResp && typeof anyResp === 'object' && 'success' in anyResp) {
      if (anyResp.success) return NextResponse.json(anyResp.data ?? null);
      return NextResponse.json({ error: anyResp.error || 'Failed to load bank details' }, { status: 500 });
    }
    return NextResponse.json(anyResp);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load bank details';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
