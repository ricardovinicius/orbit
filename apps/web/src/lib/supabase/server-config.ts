import "server-only";
import { publicSupabaseConfig } from "./config";

export function appOrigin(): string {
  if (!process.env.APP_URL) throw new Error("APP_URL is missing.");
  const url = new URL(process.env.APP_URL);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("APP_URL must be an application origin.");
  }
  return url.origin;
}

// Retain the public Auth URL and cookie identity while routing server traffic internally.
export const supabaseFetch: typeof fetch = async (input, init) => {
  const { url } = publicSupabaseConfig();
  const target = new URL(
    input instanceof Request ? input.url : input.toString(),
  );
  if (process.env.SUPABASE_INTERNAL_URL && target.origin === url) {
    const internal = new URL(process.env.SUPABASE_INTERNAL_URL);
    target.protocol = internal.protocol;
    target.host = internal.host;
  }
  return fetch(input instanceof Request ? new Request(target, input) : target, {
    ...init,
    cache: "no-store",
  });
};
