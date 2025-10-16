import { NextResponse } from 'next/server';
import { get } from '@/lib/api';

export async function GET(_req: Request, context: { params: { id: string } }) {
  try {
    const idParam = context.params?.id;
    const id = Number(idParam);
    if (!idParam || Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid lead id' }, { status: 400 });
    }

    const resp = await get(`/dealers/leads/${id}`);
    // resp is expected to be ApiResponse<Lead>
    const anyResp = resp as any;
    if (anyResp && typeof anyResp === 'object') {
      if ('success' in anyResp) {
        if (anyResp.success) {
          return NextResponse.json(anyResp.data ?? anyResp);
        }
        return NextResponse.json({ error: anyResp.error || 'Failed to fetch lead' }, { status: 500 });
      }
    }
    // Fallback
    return NextResponse.json(resp as any);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch lead';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
