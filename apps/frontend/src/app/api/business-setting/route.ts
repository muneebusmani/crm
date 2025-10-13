import { NextResponse } from 'next/server';
import { get, post } from '@/lib/api';
import type { UpsertBusinessSettingDto } from '@crm/types';

export async function GET() {
  try {
    const resp = await get('/business-setting');
    const anyResp = resp as any;
    if (anyResp && typeof anyResp === 'object' && 'success' in anyResp) {
      if (anyResp.success) return NextResponse.json(anyResp.data ?? null);
      return NextResponse.json({ error: anyResp.error || 'Failed to load settings' }, { status: 500 });
    }
    return NextResponse.json(anyResp);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UpsertBusinessSettingDto;
    const resp = await post('/business-setting', body);
    const anyResp = resp as any;
    if (anyResp && typeof anyResp === 'object' && 'success' in anyResp) {
      if (anyResp.success) return NextResponse.json(anyResp.data ?? null);
      return NextResponse.json({ error: anyResp.error || 'Failed to save settings' }, { status: 500 });
    }
    return NextResponse.json(anyResp);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to save settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
