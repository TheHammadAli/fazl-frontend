import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "@/i18n.config";

export function middleware(request: NextRequest) {
  const {
    nextUrl: { search },
  } = request;
  const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const token = request.cookies.get("token")?.value || "";
  const urlParams = "?" + new URLSearchParams(params);
  let pathname = request.nextUrl.pathname;
  const locale = request.cookies.get("lang")?.value || "en";
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  const publicRoutes: string[] = [];
  const authRoutes: string[] = [
    `/${locale}/send-otp`,
    `/${locale}/signin`,
    `/${locale}/signup`,
    `/${locale}/verify-otp`,
    `/${locale}/signup-instructor`,
    `/${locale}/forget-password`,
  ];

  function checkPathStartsWith(path: string) {
    // if (path === "/" || path === `/${locale}`) return true;
    return [...publicRoutes, ...authRoutes].some((p: string) =>
      path.startsWith(p)
    );
  }

  // Add locale if there is no locale
  if (pathnameIsMissingLocale) {
    pathname = `/${locale}${
      pathname.startsWith("/") ? "" : "/"
    }${pathname}${urlParams}`;
    return NextResponse.redirect(new URL(pathname, request.url));
  }

  if (token && checkPathStartsWith(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  if (!token && !checkPathStartsWith(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}/signin`, request.url));
  }
  return NextResponse.next();
}
export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
