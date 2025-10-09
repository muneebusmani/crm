import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.getAll().forEach((c) => {
    console.log('Cookie ===>', c);
    cookieStore.delete(c.name);
  });
  // return NextResponse.redirect(new URL('/login', 'http://localhost:3000')); // replace with your domain in production
  return NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_FRONTEND_URL),
  );
}
