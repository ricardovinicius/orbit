"use client";

import { Menu } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";
import type { ProjectNavigationEntry } from "./navigation";
import { ThemeToggle } from "./theme-toggle";

function MobileNavigationTrigger(): ReactElement {
  const { openMobile, setOpenMobile } = useSidebar();
  return (
    <div className="flex shrink-0 items-center justify-between border-b bg-background p-3 md:hidden">
      <Button
        id="mobile-navigation-trigger"
        variant="ghost"
        aria-label="Open navigation"
        aria-expanded={openMobile}
        aria-controls="mobile-navigation"
        onClick={() => setOpenMobile(true)}
      >
        <Menu data-icon="inline-start" />
        Menu
      </Button>
      <ThemeToggle />
    </div>
  );
}

export function AppShell({
  children,
  projects,
}: {
  children: ReactNode;
  projects: ProjectNavigationEntry[];
}): ReactElement {
  return (
    <TooltipProvider>
      <SidebarProvider className="workspace-shell h-dvh min-h-0 overflow-hidden">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppSidebar projects={projects} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MobileNavigationTrigger />
          <main
            id="main-content"
            tabIndex={-1}
            className="min-h-0 min-w-0 flex-1 overflow-auto"
          >
            {children}
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
