"use server";
import { revalidatePath } from "next/cache";
import { serverSupabase } from "@/lib/supabase/server";
import { appOrigin } from "@/lib/supabase/server-config";
import { safeDestination } from "./redirect";
import { validatedUser } from "./session";

export async function startGoogleSignIn(
  destination: string,
): Promise<{ url?: string; error?: string }> {
  try {
    const origin = appOrigin();
    const callback = new URL("/auth/callback", origin);
    callback.searchParams.set("next", safeDestination(destination, origin));
    const client = await serverSupabase(true);
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callback.toString(),
        scopes: "openid email profile",
        skipBrowserRedirect: true,
      },
    });
    if (error || !data.url)
      return { error: "We couldn’t start Google sign-in. Please try again." };
    return { url: data.url };
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again." };
  }
}

export async function signOut(): Promise<{ error?: string }> {
  try {
    const client = await serverSupabase(true);
    // Even an already-ended session must have its remaining cookies removed.
    await validatedUser(client);
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) return { error: "We couldn’t sign you out. Please try again." };
    revalidatePath("/", "layout");
    return {};
  } catch {
    return { error: "Sign-out is temporarily unavailable. Please try again." };
  }
}
