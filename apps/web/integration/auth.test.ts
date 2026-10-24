import { afterEach, describe, expect, it } from "vitest";
import { createAccount, testClient } from "../e2e/helpers/accounts";
import { validatedUser } from "../src/features/auth/session";

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((remove) => remove()));
});
async function account(): ReturnType<typeof createAccount> {
  const value = await createAccount();
  cleanup.push(value.cleanup);
  return value;
}

describe("real Supabase authentication and profiles", () => {
  it("provisions one private profile, synchronizes Auth data, and denies foreign reads and client writes", async () => {
    const a = await account();
    const b = await account();
    const own = await a.client.from("profiles").select("*").single();
    expect(own.error).toBeNull();
    expect(own.data).toMatchObject({
      id: a.id,
      name: "Orbit Test",
      email: a.email,
    });
    expect(
      (await a.client.from("profiles").select("*").eq("id", b.id)).data,
    ).toEqual([]);
    expect(
      (await testClient().from("profiles").select("*")).error,
    ).not.toBeNull();
    expect(
      (
        await a.client
          .from("profiles")
          .update({ name: "Changed" })
          .eq("id", a.id)
      ).error,
    ).not.toBeNull();
    expect(
      (await a.client.from("profiles").insert({ id: b.id })).error,
    ).not.toBeNull();
    expect(
      (await a.client.from("profiles").delete().eq("id", a.id)).error,
    ).not.toBeNull();
    const updated = await a.client.auth.updateUser({
      data: {
        full_name: 42,
        name: "Fallback",
        avatar_url: false,
        picture: "https://example.test/new.png",
        id: b.id,
      },
    });
    expect(updated.error).toBeNull();
    const synced = await a.client.from("profiles").select("*").single();
    expect(synced.data).toMatchObject({
      id: a.id,
      name: "Fallback",
      avatar_url: "https://example.test/new.png",
      email: a.email,
    });
    await a.client.auth.signInWithPassword({
      email: a.email,
      password: a.password,
    });
    expect((await a.client.from("profiles").select("id")).data).toEqual([
      { id: a.id },
    ]);
  });
  it("refreshes a real session and rejects signed-out token replay while retaining another device", async () => {
    const a = await account();
    const other = testClient();
    await other.auth.signInWithPassword({
      email: a.email,
      password: a.password,
    });
    const refreshed = await a.client.auth.refreshSession();
    expect(refreshed.error).toBeNull();
    expect(refreshed.data.session).not.toBeNull();
    const old = refreshed.data.session;
    if (!old) throw new Error("Missing refreshed session");
    expect((await validatedUser(a.client))?.id).toBe(a.id);
    expect((await a.client.auth.signOut({ scope: "local" })).error).toBeNull();
    const replay = testClient(old.access_token);
    expect((await replay.rpc("has_active_session")).data).toBe(false);
    expect((await replay.from("profiles").select("*")).data).toEqual([]);
    expect(await validatedUser(replay)).toBeNull();
    expect(
      (
        await testClient().auth.refreshSession({
          refresh_token: old.refresh_token,
        })
      ).error,
    ).not.toBeNull();
    expect((await validatedUser(other))?.id).toBe(a.id);
  });
});
