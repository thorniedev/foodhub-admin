import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSafeAuthReturnPath } from "./lib/authRedirect";

const SESSION_COOKIE = "foodhub_access_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (!request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = new URL("/api/auth/login", request.url);
    const returnTo = getSafeAuthReturnPath(
      `${pathname}${request.nextUrl.search}`,
    );

    loginUrl.searchParams.set("returnTo", returnTo);
    loginUrl.searchParams.set("prompt", "login");

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
