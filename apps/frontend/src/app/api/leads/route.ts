import { NextResponse, NextRequest } from 'next/server';
import { leadsApi } from '@/services/leads.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

    // If pagination params provided, use paginated method
    if (page || limit) {
      const data = await leadsApi.getAllPaginated({
        page: parseInt(page || '1', 10),
        limit: parseInt(limit || '10', 10),
        search: search || undefined,
      });
      return NextResponse.json(data);
    }

    // Otherwise return all leads (backward compatible)
    const data = await leadsApi.getAll();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch leads';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await leadsApi.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create lead';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await leadsApi.update(body);
    console.log('updated ===>', updated);
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update lead';
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
