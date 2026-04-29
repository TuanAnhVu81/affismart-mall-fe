import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type UiRole = "ADMIN" | "CUSTOMER" | "AFFILIATE" | "AFFILIATE_PENDING";

const UI_ROLE_COOKIE = "ui_role";
const HOME_PATH = "/";
const LOGIN_PATH = "/login";
const AFFILIATE_PENDING_PATH = "/affiliate/pending";
const AUTHENTICATED_PROTECTED_PREFIXES = ["/profile"];
const CUSTOMER_PROTECTED_PREFIXES = ["/orders"];
const CUSTOMER_PROTECTED_EXACT = new Set(["/checkout"]);

const getUiRole = (request: NextRequest) =>
  request.cookies.get(UI_ROLE_COOKIE)?.value as UiRole | undefined;

const redirect = (request: NextRequest, pathname: string) =>
  NextResponse.redirect(new URL(pathname, request.url));

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const uiRole = getUiRole(request);

  const isAdminRoute = pathname.startsWith("/admin");
  const isAffiliateRoute = pathname.startsWith("/affiliate");
  const isAffiliatePendingRoute = pathname === AFFILIATE_PENDING_PATH;
  const isAuthenticatedRoute = AUTHENTICATED_PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isCustomerRoute =
    CUSTOMER_PROTECTED_EXACT.has(pathname) ||
    CUSTOMER_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!uiRole && (isAdminRoute || isAffiliateRoute || isCustomerRoute || isAuthenticatedRoute)) {
    return redirect(request, LOGIN_PATH);
  }

  if (isAdminRoute && uiRole !== "ADMIN") {
    return redirect(request, HOME_PATH);
  }

  if (isAffiliateRoute) {
    if (uiRole === "AFFILIATE_PENDING" && !isAffiliatePendingRoute) {
      return redirect(request, AFFILIATE_PENDING_PATH);
    }

    if (uiRole === "AFFILIATE" && isAffiliatePendingRoute) {
      return redirect(request, "/affiliate/dashboard");
    }

    if (uiRole !== "AFFILIATE" && uiRole !== "AFFILIATE_PENDING") {
      return redirect(request, HOME_PATH);
    }
  }

  if (isCustomerRoute && uiRole !== "CUSTOMER") {
    return redirect(request, HOME_PATH);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/affiliate/:path*", "/checkout", "/orders/:path*", "/profile/:path*"],
};
