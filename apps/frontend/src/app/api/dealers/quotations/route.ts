import { NextResponse } from 'next/server';
import { quotationsApi } from '@/services/quotation.service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const leadIdParam = url.searchParams.get('leadId');
    const leadId = leadIdParam ? Number(leadIdParam) : undefined;
    const resp = await quotationsApi.getQuotations(leadId);
    console.log('quotations:', resp);
    // quotationsApi.getQuotations returns ApiResponse-like or raw; normalize
    if (Array.isArray((resp as any).data)) {
      return NextResponse.json((resp as any).data);
    }
    if (Array.isArray((resp as any).results)) {
      return NextResponse.json((resp as any).results);
    }
    if (Array.isArray(resp as any)) {
      return NextResponse.json(resp as any);
    }
    // Fallback
    return NextResponse.json(resp as any);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch quotations';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await quotationsApi.createQuotation(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create quotation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
