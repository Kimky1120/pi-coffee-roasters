import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const CANONICAL_ORIGIN = "https://www.pi-coffeeroasters.com";
const ALTERNATE_HOSTS = new Set([
  "pi-coffee-roasters.vercel.app",
  "pi-coffeeroasters.com",
]);

export async function proxy(request: NextRequest) {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = (forwardedHost ?? request.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();

  if (ALTERNATE_HOSTS.has(host)) {
    const destination = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      CANONICAL_ORIGIN,
    );
    return NextResponse.redirect(destination, 308);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
