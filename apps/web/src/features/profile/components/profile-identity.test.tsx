import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ProfileIdentity, safeAvatar } from "./profile-identity";

it("uses readable fallbacks without an email, name, or avatar", () => {
  render(
    <ProfileIdentity
      profile={{ id: "a", name: null, email: null, avatar_url: null }}
    />,
  );
  expect(screen.getByText("Your account")).toBeVisible();
  expect(screen.getByText("Email unavailable")).toBeVisible();
  expect(screen.getByText("O")).toBeVisible();
});
it.each([
  "http://example.com/image",
  "javascript:alert(1)",
  "data:image/png,x",
  "https://user:pass@example.com/image",
  "invalid",
  null,
])("rejects unsafe avatar %s", (url) => {
  expect(safeAvatar(url)).toBeUndefined();
});
it("accepts HTTPS images", () => {
  expect(safeAvatar("https://example.com/a.png")).toBe(
    "https://example.com/a.png",
  );
});
