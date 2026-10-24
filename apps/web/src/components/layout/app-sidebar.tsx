"use client";

import { Orbit, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  navigationCurrent,
  type ProjectNavigationEntry,
  primaryNavigation,
} from "./navigation";
import { ThemeToggle } from "./theme-toggle";

export function AppSidebar({
  projects,
}: {
  projects: ProjectNavigationEntry[];
}): ReactElement {
  const pathname = usePathname();
  const { open, isMobile, setOpen, setOpenMobile } = useSidebar();
  const compact = !isMobile && !open;
  function handleNavigate(): void {
    setOpenMobile(false);
  }
  return (
    <Sidebar
      collapsible="icon"
      id="workspace-sidebar"
      className="workspace-sidebar"
    >
      <SidebarHeader className="workspace-brand-row">
        <Link
          href="/"
          aria-label="Orbit home"
          onClick={handleNavigate}
          className="orbit-brand"
        >
          <Orbit aria-hidden="true" className="shrink-0" strokeWidth={1.5} />
          {!compact && (
            <span>
              orbit<span className="text-primary">.</span>
            </span>
          )}
        </Link>
        {!isMobile && (
          <Button
            variant="secondary"
            size="icon-sm"
            className="workspace-sidebar-toggle"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={open}
            aria-controls="workspace-sidebar"
            onClick={() => setOpen(!open)}
          >
            {open ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent className="workspace-navigation overflow-x-hidden group-data-[collapsible=icon]:overflow-y-auto">
        <SidebarGroup className="workspace-navigation-group">
          {!compact && <div className="workspace-nav-label">WORKSPACE</div>}
          <nav aria-label="Main navigation">
            <SidebarMenu>
              {primaryNavigation.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={!!navigationCurrent(pathname, href)}
                    tooltip={label}
                  >
                    <Link
                      href={href}
                      aria-label={label}
                      aria-current={navigationCurrent(pathname, href)}
                      onClick={handleNavigate}
                    >
                      <Icon aria-hidden="true" strokeWidth={1.7} />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
        </SidebarGroup>
        <SidebarGroup className="workspace-navigation-group workspace-project-group">
          {!compact && <div className="workspace-nav-label">YOUR PROJECTS</div>}
          <nav aria-label="Project navigation">
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={!!navigationCurrent(pathname, project.href)}
                    tooltip={project.name}
                  >
                    <Link
                      href={project.href}
                      aria-label={project.name}
                      aria-current={navigationCurrent(pathname, project.href)}
                      onClick={handleNavigate}
                    >
                      <span
                        aria-hidden="true"
                        className="project-dot"
                        data-color={project.color ?? "sage"}
                      />
                      <span>{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {projects.length === 0 && (
              <p
                className={
                  compact
                    ? "sr-only"
                    : "px-2 py-3 text-sm text-muted-foreground"
                }
              >
                Your focus areas will live here.
              </p>
            )}
          </nav>
        </SidebarGroup>
      </SidebarContent>
      {!isMobile && (
        <SidebarFooter className="workspace-sidebar-footer">
          {!compact && <span>Appearance</span>}
          <ThemeToggle />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
