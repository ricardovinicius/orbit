import type { ReactElement, ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { sampleProjects } from "@/components/layout/sample-projects";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <AppShell projects={sampleProjects}>{children}</AppShell>;
}
