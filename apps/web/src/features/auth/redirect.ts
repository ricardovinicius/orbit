export function safeDestination(value: unknown, origin: string): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";
  let decoded = value;
  try {
    // Reject nested encodings too; never turn a checked path into a different destination.
    for (let i = 0; i < 8; i++) {
      if (
        !decoded.startsWith("/") ||
        decoded.startsWith("//") ||
        decoded.includes("\\") ||
        [...decoded].some(
          (character) =>
            character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127,
        )
      )
        return "/";
      const parsed = new URL(decoded, origin);
      if (
        parsed.origin !== new URL(origin).origin ||
        /^\/auth(?:\/|$)/i.test(parsed.pathname)
      )
        return "/";
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        const result = new URL(value, origin);
        return `${result.pathname}${result.search}`;
      }
      decoded = next;
    }
  } catch {
    return "/";
  }
  return "/";
}

export function signInPath(next: string, error?: string): string {
  const query = new URLSearchParams({ next });
  if (error) query.set("error", error);
  return `/auth?${query}`;
}
