// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("next/server", async () => ({
  ...(await vi.importActual<typeof import("next/server")>("next/server")),
  connection: async () => {},
}));
const mocks = vi.hoisted(() => ({
  exchange: vi.fn(),
  validated: vi.fn(),
  profile: vi.fn(),
}));
vi.mock("@/lib/supabase/server-config", () => ({
  appOrigin: () => "https://orbit.example",
}));
vi.mock("@/features/auth/session", () => ({ validatedUser: mocks.validated }));
vi.mock("@/lib/supabase/server", () => ({
  serverSupabase: async () => ({
    auth: { exchangeCodeForSession: mocks.exchange },
    from: () => ({ select: () => ({ eq: () => ({ single: mocks.profile }) }) }),
  }),
}));
beforeEach(() => {
  mocks.exchange.mockResolvedValue({ error: null });
  mocks.validated.mockResolvedValue({ id: "a" });
  mocks.profile.mockResolvedValue({ data: { id: "a" }, error: null });
});
it("exchanges the code and restores the safe destination using the configured origin", async () => {
  const response = await GET(
    new NextRequest(
      "https://untrusted-host.example/auth/callback?code=valid&next=%2Fweek%3Fa%3D1",
    ),
  );
  expect(mocks.exchange).toHaveBeenCalledWith("valid");
  expect(response.headers.get("location")).toBe(
    "https://orbit.example/week?a=1",
  );
  expect(response.headers.get("cache-control")).toContain("no-store");
});
it.each([
  "?error=access_denied&error_description=secret",
  "",
  "?error=server_error",
])("keeps invalid/provider callbacks recoverable: %s", async (query) => {
  const response = await GET(
    new NextRequest(`https://orbit.example/auth/callback${query}`),
  );
  expect(response.headers.get("location")).toContain("/auth?");
  expect(response.headers.get("location")).not.toContain("secret");
  expect(mocks.exchange).not.toHaveBeenCalled();
});
it("rejects expired/replayed codes and unsafe return URLs", async () => {
  mocks.exchange.mockResolvedValue({ error: { message: "secret diagnostic" } });
  const response = await GET(
    new NextRequest(
      "https://orbit.example/auth/callback?code=reused&next=https://evil.example",
    ),
  );
  expect(response.headers.get("location")).toBe(
    "https://orbit.example/auth?next=%2F&error=callback",
  );
});
it("does not enter the workspace if provisioning is unavailable", async () => {
  mocks.profile.mockResolvedValue({
    error: { message: "failure" },
    data: null,
  });
  const response = await GET(
    new NextRequest("https://orbit.example/auth/callback?code=valid"),
  );
  expect(response.headers.get("location")).toContain("error=unavailable");
});
