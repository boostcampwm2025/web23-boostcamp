import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/" || pathname.startsWith("/api/auth/google/callback")) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("user-session");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
