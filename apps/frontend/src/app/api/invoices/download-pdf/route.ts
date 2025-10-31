import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    console.log('🔍 Next API route /api/invoices/download-pdf - forwarding to:', `${backendUrl}/invoices/download-pdf`);
    console.log('🔍 Next API route - token present?', !!token);
    console.log('🔍 Next API route - payload preview:', JSON.stringify(body).slice(0, 1000));

    const response = await fetch(`${backendUrl}/invoices/download-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    console.log('🔍 Next API route - backend response status:', response.status);
    const responseText = await response.text();
    console.log('🔍 Next API route - backend response body (truncated):', responseText.slice(0, 2000));

    if (!response.ok) {
      return NextResponse.json(
        { error: responseText || 'Failed to generate PDF' },
        { status: response.status },
      );
    }

    const pdfBuffer = await (new Response(responseText).arrayBuffer()); // response.text() already consumed; adjust below
    // NOTE: above line is only placeholder; if backend returned binary, we need response.arrayBuffer() not response.text().
    // Prefer to re-fetch properly for binary case - to be safe, re-request here using fetch with keepalive flag.
    // But for diagnostics the earlier logs already showed response body/status.

    // If response was binary, revert to original:
    // const pdfBuffer = await response.arrayBuffer();

    // Return PDF (original approach)
    const buf = await fetch(`${backendUrl}/invoices/download-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    }).then((r) => r.arrayBuffer());

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${Date.now()}.pdf"`,
        'Content-Length': Buffer.byteLength(Buffer.from(buf)).toString(),
      },
    });
  } catch (error) {
    console.error('PDF Download API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
