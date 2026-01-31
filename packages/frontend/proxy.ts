import { NextRequest, NextResponse } from "next/server";
import { isDevAuthEnabled } from "./app/lib/server/env";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isDevAuthEnabled()) {
    return NextResponse.next();
  }

  if (pathname === "/" || pathname.startsWith("/api/auth/google/callback")) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("user-session");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
