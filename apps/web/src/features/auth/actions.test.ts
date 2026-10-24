// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { signOut, startGoogleSignIn } from "./actions";

const mocks = vi.hoisted(() => ({
  oauth: vi.fn(),
  signOut: vi.fn(),
  validate: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/supabase/server-config", () => ({
  appOrigin: () => "https://orbit.example",
}));
vi.mock("./session", () => ({ validatedUser: mocks.validate }));
vi.mock("@/lib/supabase/server", () => ({
  serverSupabase: async () => ({
    auth: { signInWithOAuth: mocks.oauth, signOut: mocks.signOut },
  }),
}));
beforeEach(() => {
  mocks.oauth.mockResolvedValue({
    data: { url: "https://supabase.example/auth/v1/authorize" },
    error: null,
  });
  mocks.signOut.mockResolvedValue({ error: null });
  mocks.validate.mockResolvedValue({ id: "owner" });
});
it("uses Google with a validated callback and minimal scopes", async () => {
  expect((await startGoogleSignIn("//evil.example")).url).toBeDefined();
  expect(mocks.oauth).toHaveBeenCalledWith({
    provider: "google",
    options: {
      redirectTo: "https://orbit.example/auth/callback?next=%2F",
      scopes: "openid email profile",
      skipBrowserRedirect: true,
    },
  });
});
it("does not expose provider diagnostics", async () => {
  mocks.oauth.mockResolvedValue({ data: {}, error: { message: "secret" } });
  const result = await startGoogleSignIn("/");
  expect(result.error).toContain("try again");
  expect(result.error).not.toContain("secret");
});
it("ends only the current session and clears navigation caches", async () => {
  expect(await signOut()).toEqual({});
  expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
  expect(mocks.revalidate).toHaveBeenCalledWith("/", "layout");
});
it("does not report completion when revocation fails", async () => {
  mocks.signOut.mockResolvedValue({ error: { message: "offline" } });
  expect((await signOut()).error).toContain("try again");
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
