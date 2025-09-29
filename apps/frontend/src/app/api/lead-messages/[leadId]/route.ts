import { NextResponse } from 'next/server';
import { leadMessagesApi } from '@/services/lead-messages.service';

export async function GET(
  _req: Request,
  { params }: { params: { leadId: string } },
) {
  try {
    const leadId = parseInt(params.leadId, 10);
    if (Number.isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid leadId' }, { status: 400 });
    }
    const data = await leadMessagesApi.getByLead(leadId);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch lead messages by leadId';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
