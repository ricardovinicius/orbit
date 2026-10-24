import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { AUTH_COOKIE_NAME, publicSupabaseConfig } from "./config";
import type { Database } from "./database.types";
import { appOrigin, supabaseFetch } from "./server-config";

export async function serverSupabase(
  writable = false,
): Promise<SupabaseClient<Database>> {
  await connection();
  const store = await cookies();
  const { url, key } = publicSupabaseConfig();
  return createServerClient<Database>(url, key, {
    global: { fetch: supabaseFetch },
    cookieOptions: {
      name: AUTH_COOKIE_NAME,
      sameSite: "lax",
      secure: appOrigin().startsWith("https:"),
    },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        // Proxy refreshes before Server Components, which cannot write cookies.
        if (writable)
          for (const { name, value, options } of values)
            store.set(name, value, options);
      },
    },
  });
}
