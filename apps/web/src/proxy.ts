import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { safeDestination, signInPath } from "@/features/auth/redirect";
import { validatedUser } from "@/features/auth/session";
import { AUTH_COOKIE_NAME, publicSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";
import { appOrigin, supabaseFetch } from "@/lib/supabase/server-config";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const origin = appOrigin();
  // Choose the origin from environment only. Redirect aliases before creating PKCE cookies.
  const isVercel =
    !!process.env.VERCEL_URL || process.env.VERCEL_ENV === "production";
  const requestHost = request.headers.get("host") ?? request.nextUrl.host;
  if (isVercel && requestHost.toLowerCase() !== new URL(origin).host) {
    const canonical = new URL(origin);
    canonical.pathname = request.nextUrl.pathname;
    canonical.search = request.nextUrl.search;
    const response = NextResponse.redirect(canonical, 307);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }
  const path = request.nextUrl.pathname;
  const next = safeDestination(`${path}${request.nextUrl.search}`, origin);
  const headers = new Headers(request.headers);
  headers.set("x-orbit-path", next);
  let response = NextResponse.next({ request: { headers } });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  // The callback owns the exchange; refreshing here can race its PKCE cookies.
  if (path === "/auth/callback") return response;
  const { url, key } = publicSupabaseConfig();
  const client = createServerClient<Database>(url, key, {
    global: { fetch: supabaseFetch },
    cookieOptions: {
      name: AUTH_COOKIE_NAME,
      sameSite: "lax",
      secure: origin.startsWith("https:"),
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values, cacheHeaders) => {
        for (const { name, value } of values) request.cookies.set(name, value);
        headers.set("cookie", request.cookies.toString());
        const previous = response;
        response = NextResponse.next({ request: { headers } });
        response.headers.set("Cache-Control", "private, no-store");
        response.headers.set("Referrer-Policy", "no-referrer");
        for (const cookie of previous.cookies.getAll())
          response.cookies.set(cookie);
        for (const { name, value, options } of values)
          response.cookies.set(name, value, options);
        for (const [name, value] of Object.entries(cacheHeaders))
          response.headers.set(name, value);
      },
    },
  });
  function redirectTo(destination: string): NextResponse {
    const redirected = NextResponse.redirect(new URL(destination, origin), 303);
    redirected.headers.set("Cache-Control", "private, no-store");
    for (const cookie of response.cookies.getAll())
      redirected.cookies.set(cookie);
    return redirected;
  }
  try {
    const user = await validatedUser(client);
    if (!user && path !== "/auth") return redirectTo(signInPath(next));
  } catch {
    if (path !== "/auth") return redirectTo(signInPath(next, "unavailable"));
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
  ],
};
