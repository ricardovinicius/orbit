import { expect, test } from "@playwright/test";

test("uses system appearance until a choice is saved, then preserves it across reloads", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const root = page.locator("html");
  const toggle = page
    .getByRole("button", { name: "Toggle dark mode" })
    .filter({ visible: true });
  await expect(root).toHaveClass(/dark/);
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).not.toHaveClass(/dark/);
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(root).toHaveClass(/dark/);
  await page.reload();
  await expect(root).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await toggle.click();
  await expect(root).not.toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  await expect(root).not.toHaveClass(/dark/);
  await page.setViewportSize({ width: 375, height: 667 });
  await toggle.click();
  await expect(root).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCSS(
    "background-color",
    "rgb(27, 28, 34)",
  );
});

test("theme switching works when browser storage is unavailable", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage unavailable");
      },
    });
  });
  await page.goto("/");
  const toggle = page
    .getByRole("button", { name: "Toggle dark mode" })
    .filter({ visible: true });
  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
