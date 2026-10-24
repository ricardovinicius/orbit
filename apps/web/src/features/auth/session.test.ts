import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { AuthUnavailableError, validatedUser } from "./session";

function client(
  user: unknown,
  error: unknown = null,
  active: unknown = true,
  rpcError: unknown = null,
): SupabaseClient<Database> {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error }) },
    rpc: vi.fn().mockResolvedValue({ data: active, error: rpcError }),
  } as unknown as SupabaseClient<Database>;
}
describe("validated identity", () => {
  it("requires a validated user and a live session", async () => {
    expect(await validatedUser(client({ id: "a" }))).toEqual({ id: "a" });
  });
  it("rejects a revoked session even with a valid identity", async () => {
    expect(await validatedUser(client({ id: "a" }, null, false))).toBeNull();
  });
  it("rejects expired or malformed credentials before querying private data", async () => {
    const supabase = client(null, { status: 401 });
    expect(await validatedUser(supabase)).toBeNull();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
  it("does not mistake outages for a successful check", async () => {
    await expect(
      validatedUser(client(null, { status: 503 })),
    ).rejects.toBeInstanceOf(AuthUnavailableError);
    await expect(
      validatedUser(client({ id: "a" }, null, null, { message: "offline" })),
    ).rejects.toBeInstanceOf(AuthUnavailableError);
  });
});
