import { NextResponse } from 'next/server';
import { invoicesApi } from '@/services/invoices.service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const leadIdParam = url.searchParams.get('leadId');
    const leadId = leadIdParam ? Number(leadIdParam) : undefined;
    const all = await invoicesApi.getAll();
    const filtered = typeof leadId === 'number' && !Number.isNaN(leadId)
      ? all.filter((i) => (i.lead as any)?.id === leadId)
      : all;
    return NextResponse.json(filtered);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch invoices';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await invoicesApi.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create invoice';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
