// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import { proxy } from "./proxy";

const mocks = vi.hoisted(() => ({ user: vi.fn(), refresh: false }));
vi.mock("@/lib/supabase/server-config", () => ({
  appOrigin: () => "https://orbit.example",
  supabaseFetch: vi.fn(),
}));
vi.mock("@/lib/supabase/config", () => ({
  AUTH_COOKIE_NAME: "orbit-auth",
  publicSupabaseConfig: () => ({
    url: "https://supabase.example",
    key: "public",
  }),
}));
vi.mock("@/features/auth/session", () => ({ validatedUser: mocks.user }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          values: Array<{
            name: string;
            value: string;
            options: { path: string };
          }>,
          headers: Record<string, string>,
        ) => void;
      };
    },
  ) => {
    if (mocks.refresh)
      options.cookies.setAll(
        [{ name: "orbit-auth", value: "refreshed", options: { path: "/" } }],
        { "Cache-Control": "private, no-store" },
      );
    return {};
  },
}));
beforeEach(() => {
  mocks.user.mockResolvedValue({ id: "owner" });
  mocks.refresh = false;
});
it("propagates refreshed cookies to the browser and downstream components", async () => {
  mocks.refresh = true;
  const response = await proxy(
    new NextRequest("https://orbit.example/", {
      headers: {
        cookie: "orbit-auth=old",
        "x-orbit-path": "https://evil.example",
      },
    }),
  );
  expect(response.cookies.get("orbit-auth")?.value).toBe("refreshed");
  expect(response.headers.get("x-middleware-request-cookie")).toContain(
    "orbit-auth=refreshed",
  );
  expect(response.headers.get("x-middleware-request-x-orbit-path")).toBe("/");
});
it("retains refreshed cookies on a redirect", async () => {
  mocks.refresh = true;
  mocks.user.mockResolvedValue(null);
  const response = await proxy(
    new NextRequest("https://orbit.example/?view=focus"),
  );
  expect(response.cookies.get("orbit-auth")?.value).toBe("refreshed");
  expect(
    new URL(response.headers.get("location") ?? "").searchParams.get("next"),
  ).toBe("/?view=focus");
  expect(response.headers.get("cache-control")).toContain("no-store");
});
it("fails closed on outages while keeping sign-in retryable", async () => {
  mocks.user.mockRejectedValue(new Error("offline"));
  expect(
    (await proxy(new NextRequest("https://orbit.example/"))).headers.get(
      "location",
    ),
  ).toContain("error=unavailable");
  expect(
    (await proxy(new NextRequest("https://orbit.example/auth"))).status,
  ).toBe(200);
});
it("leaves the callback exchange to its handler", async () => {
  await proxy(
    new NextRequest("https://orbit.example/auth/callback?code=valid"),
  );
  expect(mocks.user).not.toHaveBeenCalled();
});
