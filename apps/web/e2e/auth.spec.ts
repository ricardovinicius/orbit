import { type BrowserContext, expect, test } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { createAccount } from "./helpers/accounts";

async function authenticate(
  context: BrowserContext,
  account: Awaited<ReturnType<typeof createAccount>>,
): Promise<void> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    {
      cookieOptions: { name: "orbit-auth" },
      cookies: {
        getAll: () => [],
        setAll: async (values) => {
          await context.addCookies(
            values.map(({ name, value }) => ({
              name,
              value,
              domain: "127.0.0.1",
              path: "/",
              sameSite: "Lax" as const,
            })),
          );
        },
      },
    },
  );
  const { error } = await supabase.auth.setSession(account.session);
  if (error) throw new Error("Could not establish browser test session.");
}

test("anonymous requests retain their destination and callbacks expose recoverable errors", async ({
  page,
}) => {
  await page.goto("/?view=focus");
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  expect(new URL(page.url()).searchParams.get("next")).toBe("/?view=focus");
  await page.goto(
    "/auth/callback?error=access_denied&error_description=do-not-display&next=https://evil.example",
  );
  await expect(
    page.getByRole("alert").filter({ hasText: "cancelled" }),
  ).toBeVisible();
  await expect(page.getByText("do-not-display")).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("next")).toBe("/");
  await page.goto("/auth/callback?code=expired");
  await expect(
    page.getByRole("alert").filter({ hasText: "invalid or has expired" }),
  ).toBeVisible();
});

test("a real session survives reloads, skips sign-in, and loses access after sign-out", async ({
  page,
  context,
}) => {
  const account = await createAccount();
  try {
    await authenticate(context, account);
    await page.goto("/auth?next=%2F%3Fview%3Dfocus");
    await expect(
      page.getByRole("heading", { name: "Your workspace" }),
    ).toBeVisible();
    expect(new URL(page.url()).search).toBe("?view=focus");
    await expect(page.getByText(account.email)).toBeVisible();
    await page.reload();
    await expect(page.getByText(account.email)).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
    await page.goBack();
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
    await expect(page.getByText(account.email)).toHaveCount(0);
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  } finally {
    await account.cleanup();
  }
});

test("an externally revoked session cannot reopen protected content", async ({
  page,
  context,
}) => {
  const account = await createAccount();
  try {
    await authenticate(context, account);
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Your workspace" }),
    ).toBeVisible();
    await account.client.auth.signOut({ scope: "global" });
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
    await expect(page.getByText(account.email)).toHaveCount(0);
  } finally {
    await account.cleanup();
  }
});

test("expired cookies refresh when possible and return to sign-in when renewal fails", async ({
  page,
  context,
}) => {
  const account = await createAccount();
  try {
    const stale = { ...account.session, expires_at: 1 };
    const value = `base64-${Buffer.from(JSON.stringify(stale)).toString("base64url")}`;
    await context.addCookies([
      {
        name: "orbit-auth",
        value,
        domain: "127.0.0.1",
        path: "/",
        sameSite: "Lax",
      },
    ]);
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Your workspace" }),
    ).toBeVisible();
    expect(
      (await context.cookies()).find((cookie) => cookie.name === "orbit-auth")
        ?.value,
    ).not.toBe(value);
    await context.clearCookies();
    const invalid = `base64-${Buffer.from(JSON.stringify({ ...stale, refresh_token: "revoked-refresh-token" })).toString("base64url")}`;
    await context.addCookies([
      {
        name: "orbit-auth",
        value: invalid,
        domain: "127.0.0.1",
        path: "/",
        sameSite: "Lax",
      },
    ]);
    await page.goto("/?view=recover");
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
    expect(new URL(page.url()).searchParams.get("next")).toBe("/?view=recover");
  } finally {
    await account.cleanup();
  }
});
