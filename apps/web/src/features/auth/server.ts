import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/supabase/database.types";
import { serverSupabase } from "@/lib/supabase/server";
import { appOrigin } from "@/lib/supabase/server-config";
import { safeDestination, signInPath } from "./redirect";
import { validatedUser } from "./session";

export async function requireUser(): Promise<{
  client: SupabaseClient<Database>;
  user: User;
}> {
  const next = safeDestination(
    (await headers()).get("x-orbit-path"),
    appOrigin(),
  );
  const client = await serverSupabase();
  const user = await validatedUser(client);
  if (!user) redirect(signInPath(next, "session"));
  return { client, user };
}
