import { redirect } from "next/navigation";
import { authErrorMessage } from "@/features/auth/errors";
import { SignInPage } from "@/features/auth/page";
import { safeDestination } from "@/features/auth/redirect";
import { validatedUser } from "@/features/auth/session";
import { serverSupabase } from "@/lib/supabase/server";
import { appOrigin } from "@/lib/supabase/server-config";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const next = safeDestination(params.next, appOrigin());
  let error = authErrorMessage(params.error);
  let ready = false;
  try {
    const client = await serverSupabase();
    const user = await validatedUser(client);
    if (user) {
      const profile = await client
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      ready = !profile.error && !!profile.data;
      if (!ready) error = authErrorMessage("unavailable");
    }
  } catch {
    error = authErrorMessage("unavailable");
  }
  if (ready) redirect(next);
  return <SignInPage next={next} error={error} />;
}
