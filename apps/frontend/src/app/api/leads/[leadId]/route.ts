import { NextResponse } from 'next/server';
import { leadsApi } from '@/services/leads.service';

export async function GET(
  _req: Request,
  props: { params: Promise<{ leadId: string }> },
) {
  const params = await props.params;
  try {
    const id = parseInt(params.leadId, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid leadId' }, { status: 400 });
    }
    const lead = await leadsApi.getOne(id);
    return NextResponse.json(lead);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch lead';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ leadId: string }> },
) {
  const params = await props.params;
  try {
    const id = parseInt(params.leadId, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid leadId' }, { status: 400 });
    }
    await leadsApi.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to delete lead';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
