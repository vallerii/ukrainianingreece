import { NextResponse, type NextRequest } from "next/server";

/**
 * /novyny      → внутрішньо /uk/novyny (адреса в браузері не змінюється)
 * /en/novyny   → як є
 * /uk/novyny   → 308 на /novyny (українська — без префікса)
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname === "/uk" || pathname.startsWith("/uk/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (/^\/(en|el)(\/|$)/.test(pathname)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/uk${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  // усе, крім API, службових файлів Next і статичних файлів з розширенням
  matcher: ["/((?!api|_next|.*\\.[a-zA-Z0-9]{2,5}$).*)"],
};
