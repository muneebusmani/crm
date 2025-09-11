import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Public routes that should be accessible without auth
  const publicRoutes = ["/login", "/register", "/forgot-password"];

  // If visiting a public route
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // Already logged in? Redirect away from login/register
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // For all other routes (private)
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/dealer/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
