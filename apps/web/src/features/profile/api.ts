import "server-only";
import { requireUser } from "@/features/auth/server";
import type { Database } from "@/lib/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function ownProfile(): Promise<Profile> {
  const { client, user } = await requireUser();
  const { data, error } = await client
    .from("profiles")
    .select("id, name, avatar_url, email")
    .eq("id", user.id)
    .single();
  if (error || !data)
    throw new Error("Your profile is temporarily unavailable.");
  return data;
}
