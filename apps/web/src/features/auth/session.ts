import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export class AuthUnavailableError extends Error {
  constructor() {
    super("Authentication is temporarily unavailable.");
  }
}

export async function validatedUser(
  client: SupabaseClient<Database>,
): Promise<User | null> {
  const { data, error } = await client.auth.getUser();
  if (error) {
    if (
      error.status === 0 ||
      (error.status && error.status >= 500) ||
      error.name === "AuthRetryableFetchError"
    )
      throw new AuthUnavailableError();
    return null;
  }
  if (!data.user) return null;
  const session = await client.rpc("has_active_session");
  if (session.error) throw new AuthUnavailableError();
  return session.data === true ? data.user : null;
}
