import { connection, type NextRequest, NextResponse } from "next/server";
import { safeDestination, signInPath } from "@/features/auth/redirect";
import { validatedUser } from "@/features/auth/session";
import { serverSupabase } from "@/lib/supabase/server";
import { appOrigin } from "@/lib/supabase/server-config";

export async function GET(request: NextRequest): Promise<NextResponse> {
  await connection();
  const origin = appOrigin();
  const next = safeDestination(
    request.nextUrl.searchParams.get("next"),
    origin,
  );
  function result(path: string): NextResponse {
    const response = NextResponse.redirect(new URL(path, origin), 303);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }
  const providerError = request.nextUrl.searchParams.get("error");
  if (providerError)
    return result(
      signInPath(
        next,
        providerError === "access_denied" ? "denied" : "provider",
      ),
    );
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return result(signInPath(next, "callback"));
  try {
    const client = await serverSupabase(true);
    const exchange = await client.auth.exchangeCodeForSession(code);
    if (exchange.error) return result(signInPath(next, "callback"));
    const user = await validatedUser(client);
    if (!user) return result(signInPath(next, "callback"));
    const profile = await client
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
    if (profile.error || !profile.data)
      return result(signInPath(next, "unavailable"));
    return result(next);
  } catch {
    return result(signInPath(next, "unavailable"));
  }
}
