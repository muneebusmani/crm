import { NextResponse } from 'next/server';
import { quotationsApi } from '@/services/quotation.service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const leadIdParam = url.searchParams.get('leadId');
    const leadId = leadIdParam ? Number(leadIdParam) : undefined;
    const all = await quotationsApi.getAll();
    const filtered = typeof leadId === 'number' && !Number.isNaN(leadId)
      ? all.filter((i) => (i.lead as any)?.id === leadId)
      : all;
    return NextResponse.json(filtered);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch quotations';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Get the selected profile ID from cookies
    const { cookies: getCookies } = await import('next/headers');
    const cookieStore = await getCookies();
    const profileId = cookieStore.get('selected_profile_id')?.value;
    
    // Add profile ID to the request body
    const bodyWithProfile = {
      ...body,
      companyUserId: profileId ? Number(profileId) : undefined,
    };
    
    const created = await quotationsApi.create(bodyWithProfile);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create quotation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
