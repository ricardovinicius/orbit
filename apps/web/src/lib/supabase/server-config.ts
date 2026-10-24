import "server-only";
import { publicSupabaseConfig } from "./config";

export function appOrigin(): string {
  const vercelHost =
    process.env.VERCEL_ENV === "production"
      ? (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL)
      : process.env.VERCEL_URL;
  if (process.env.VERCEL_ENV === "production" && !vercelHost) {
    throw new Error("Vercel production URL is missing.");
  }
  const value = vercelHost
    ? `https://${vercelHost}`
    : process.env.APP_URL || "http://localhost:3000";
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    (vercelHost && (url.host !== vercelHost.toLowerCase() || url.port))
  )
    throw new Error(
      "Application URL must be an origin; Vercel URLs must be hostnames.",
    );
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
