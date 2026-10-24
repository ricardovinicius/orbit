import {
  BarChart3,
  CalendarDays,
  Clock3,
  FolderClosed,
  Sun,
} from "lucide-react";

export const primaryNavigation = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/week", label: "Week", icon: CalendarDays },
  { href: "/projects", label: "Projects", icon: FolderClosed },
  { href: "/sessions", label: "Sessions", icon: Clock3 },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

export function navigationCurrent(
  pathname: string,
  href: string,
): "page" | "location" | undefined {
  const path = pathname.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (path === href) return "page";
  return href !== "/" && path.startsWith(`${href}/`) ? "location" : undefined;
}

export type ProjectNavigationEntry = {
  id: string;
  name: string;
  href: string;
  color?: "sage" | "violet" | "blue" | "amber" | "rose";
};
