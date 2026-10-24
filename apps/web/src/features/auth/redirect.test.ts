import { describe, expect, it } from "vitest";
import { safeDestination, signInPath } from "./redirect";

const origin = "https://orbit.example";
describe("return destinations", () => {
  it.each(["/", "/projects/123?view=tasks", "/week?day=Monday"])(
    "preserves %s",
    (path) => {
      expect(safeDestination(path, origin)).toBe(path);
    },
  );
  it.each([
    undefined,
    ["/week"],
    "https://evil.example",
    "//evil.example",
    "/%2fevil.example",
    "/%252fevil.example",
    "/\\evil.example",
    "/%5cevil.example",
    "/%255cevil.example",
    "/auth",
    "/auth/callback?code=secret",
    "/%61uth",
    "/a/../auth",
    "/%2e%2e/auth",
    "/%",
    "/%GG",
    "/%00evil",
    "/%250aevil",
    "/path\n",
    "javascript:alert(1)",
    "/auth/../auth",
  ])("rejects %s", (path) => {
    expect(safeDestination(path, origin)).toBe("/");
  });
  it("drops fragments and encodes nested queries once", () => {
    expect(safeDestination("/week?day=1#time", origin)).toBe("/week?day=1");
    expect(
      new URL(signInPath("/week?a=1&b=2", "session"), origin).searchParams.get(
        "next",
      ),
    ).toBe("/week?a=1&b=2");
  });
});
