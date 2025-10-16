import { NextResponse } from 'next/server';
import { leadsApi } from '@/services/leads.service';

export async function GET() {
  try {
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
