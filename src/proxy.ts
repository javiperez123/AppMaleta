import { NextResponse, type NextRequest } from "next/server";

// Comprobación optimista: sin cookie de sesión, las pantallas privadas redirigen a /login.
// La autorización real se hace en el servidor (requireUser) en cada página y acción.
const SESSION_COOKIE = "maleta_session";

export function proxy(request: NextRequest) {
  if (!request.cookies.get(SESSION_COOKIE)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/today/:path*",
    "/wardrobe/:path*",
    "/trips/:path*",
    "/trip/:path*",
    "/favorites/:path*",
    "/train/:path*",
    "/account/:path*",
  ],
};
