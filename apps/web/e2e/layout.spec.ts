import { expect, test } from "@playwright/test";

test("desktop navigation preserves collapse state and supports history", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 480 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Today", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  const week = page.getByRole("link", { name: "Week", exact: true });
  await week.focus();
  await expect(
    page.getByRole("tooltip", { name: "Week", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Week", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Expand sidebar" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "University", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Projects", exact: true }),
  ).toHaveAttribute("aria-current", "location");
  await expect(
    page.getByRole("link", { name: "University", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.goBack();
  await expect(week).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(
    page.getByRole("button", { name: "Collapse sidebar" }),
  ).toBeVisible();
  await page.goto("/projects/work");
  await expect(
    page.getByRole("heading", { name: "Work", exact: true }),
  ).toBeVisible();
  await page.goto("/projects/unknown");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

for (const width of [320, 375]) {
  test(`mobile navigation at ${width}px restores focus and closes on navigation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 568 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open navigation" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Navigation" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Close", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(dialog).toContainText("orbit");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole("link", { name: "Progress", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Progress", exact: true }),
    ).toBeVisible();
    await expect(dialog).not.toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await trigger.click();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(trigger).toBeFocused();
  });
}

test("long content and navigation remain independently scrollable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 480 });
  await page.goto("/");
  // Stress the rendered layout without adding product routes or fixture controls.
  await page
    .getByRole("navigation", { name: "Project navigation" })
    .evaluate((nav) => {
      const list = nav.querySelector("ul");
      const item = list?.firstElementChild;
      if (!list || !item) throw new Error("Missing project navigation");
      for (let index = 0; index < 40; index++) {
        const copy = item.cloneNode(true) as HTMLElement;
        const label = copy.querySelector("span:last-child");
        if (label) label.textContent = "A very long project name ".repeat(8);
        list.append(copy);
      }
    });
  await page.getByRole("main").evaluate((main) => {
    for (let index = 0; index < 80; index++) {
      const paragraph = document.createElement("p");
      paragraph.textContent = `Long page content ${index}`;
      main.append(paragraph);
    }
  });
  const scrollingNavigation = page.locator('[data-slot="sidebar-content"]');
  expect(
    await scrollingNavigation.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await scrollingNavigation.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await page.getByRole("main").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(
    page.getByRole("button", { name: "Collapse sidebar" }),
  ).toBeInViewport();
  await expect(page.getByRole("link", { name: "Orbit home" })).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
