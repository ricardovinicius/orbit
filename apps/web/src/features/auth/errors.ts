const messages: Record<string, string> = {
  denied: "Google sign-in was cancelled. You can try again when you’re ready.",
  callback: "This sign-in link is invalid or has expired. Please try again.",
  provider: "Google sign-in failed. Please try again.",
  unavailable: "We couldn’t load your account. Please try again.",
  session: "Your session has ended. Please sign in again.",
};
export function authErrorMessage(code: unknown): string | undefined {
  return typeof code === "string" ? messages[code] : undefined;
}
