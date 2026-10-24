import { randomUUID } from "node:crypto";
import {
  createClient,
  type Session,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type { Database } from "../../src/lib/supabase/database.types";

export function testClient(token?: string): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (
    !url ||
    !key ||
    !["localhost", "127.0.0.1"].includes(new URL(url).hostname) ||
    new URL(url).port !== "55321"
  )
    throw new Error(
      "Tests require the dedicated local Supabase instance on port 55321.",
    );
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined,
  });
}

export async function createAccount(): Promise<{
  id: string;
  email: string;
  password: string;
  session: Session;
  client: SupabaseClient<Database>;
  cleanup: () => Promise<void>;
}> {
  testClient();
  const key = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing test-only service role key.");
  const admin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    key,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const email = `orbit-${randomUUID()}@example.test`;
  const password = randomUUID();
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: "Orbit Test",
      avatar_url: "https://example.test/avatar.png",
    },
  });
  if (created.error || !created.data.user)
    throw new Error("Could not create isolated test account.");
  const id = created.data.user.id;
  const client = testClient();
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error || !login.data.session) {
    await admin.auth.admin.deleteUser(id);
    throw new Error("Could not create a real test session.");
  }
  return {
    id,
    email,
    password,
    session: login.data.session,
    client,
    cleanup: async () => {
      const result = await admin.auth.admin.deleteUser(id);
      if (result.error) throw new Error("Test account cleanup failed.");
    },
  };
}
