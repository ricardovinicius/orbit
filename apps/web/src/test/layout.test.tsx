import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import WorkspaceLayout from "@/app/(workspace)/layout";
import RootLayout from "@/app/layout";
import { AppShell } from "@/components/layout/app-shell";
import { navigationCurrent } from "@/components/layout/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { sampleProjects } from "@/components/layout/sample-projects";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/university",
}));
vi.stubGlobal(
  "matchMedia",
  vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);

describe("active navigation", () => {
  it.each([
    ["/", "/", "page"],
    ["/week", "/", undefined],
    ["/week", "/week", "page"],
    ["/week/day", "/week", "location"],
    ["/weekend", "/week", undefined],
    ["/projects/alpha/tasks", "/projects", "location"],
    ["/projects/alpha/tasks", "/projects/alpha", "location"],
    ["/projects/alpha-2", "/projects/alpha", undefined],
    ["/week?date=1#today", "/week", "page"],
  ])("matches %s against %s", (path, href, current) => {
    expect(navigationCurrent(path, href)).toBe(current);
  });
});

it("keeps selected links accessible when collapsed and expanded", async () => {
  const user = userEvent.setup();
  render(
    <AppShell projects={sampleProjects}>
      <h1>University</h1>
    </AppShell>,
  );
  expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  const project = screen.getByRole("link", { name: "University" });
  expect(project).toHaveAttribute("aria-current", "page");
  expect(project).toHaveAttribute("href", "/projects/university");
  await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
  expect(
    screen.getByRole("button", { name: "Expand sidebar" }),
  ).toHaveAttribute("aria-expanded", "false");
  expect(project).toHaveAccessibleName("University");
  await user.click(screen.getByRole("button", { name: "Expand sidebar" }));
  expect(
    screen.getByRole("button", { name: "Collapse sidebar" }),
  ).toHaveAttribute("aria-expanded", "true");
});

it("renders empty project guidance", () => {
  render(
    <AppShell projects={[]}>
      <h1>Today</h1>
    </AppShell>,
  );
  expect(screen.getByText("Your focus areas will live here.")).toBeVisible();
});

it("supports optional header descriptions and actions", () => {
  const { rerender } = render(<PageHeader title="Today" />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Today");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  rerender(
    <PageHeader
      title="Week"
      description="Plan your week"
      actions={<button type="button">Example action</button>}
    />,
  );
  expect(screen.getByText("Plan your week")).toBeVisible();
  expect(screen.getByRole("button", { name: "Example action" })).toBeVisible();
});

it("leaves the root shell-free and mounts workspace navigation once", () => {
  const root = RootLayout({
    params: Promise.resolve({}),
    children: <p>Outside workspace</p>,
  });
  const markup = renderToStaticMarkup(root);
  expect(markup).toContain("Outside workspace");
  expect(markup).not.toContain("Main navigation");
  render(
    <WorkspaceLayout>
      <h1>Today</h1>
    </WorkspaceLayout>,
  );
  expect(
    screen.getAllByRole("navigation", { name: "Main navigation" }),
  ).toHaveLength(1);
  expect(screen.getAllByRole("main")).toHaveLength(1);
});
