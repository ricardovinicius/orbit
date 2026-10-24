"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AUTH_COOKIE_NAME, publicSupabaseConfig } from "./config";
import type { Database } from "./database.types";

export function browserSupabase(): SupabaseClient<Database> {
  const { url, key } = publicSupabaseConfig();
  return createBrowserClient<Database>(url, key, {
    cookieOptions: {
      name: AUTH_COOKIE_NAME,
      sameSite: "lax",
      secure: window.location.protocol === "https:",
    },
  });
}
