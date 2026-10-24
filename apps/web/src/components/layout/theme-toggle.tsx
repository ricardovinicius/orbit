"use client";

import { Moon, Sun } from "lucide-react";
import { type ReactElement, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { THEME_CHANGE_EVENT, THEME_STORAGE_KEY } from "@/lib/theme";

export function ThemeToggle(): ReactElement {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");

    function syncPreference(): void {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        // Theme switching still works when storage is unavailable.
      }
      const dark = saved === "dark" || (saved !== "light" && system.matches);
      document.documentElement.classList.toggle("dark", dark);
      setIsDark(dark);
    }

    function syncToggle(): void {
      setIsDark(document.documentElement.classList.contains("dark"));
    }

    syncPreference();
    system.addEventListener("change", syncPreference);
    window.addEventListener("storage", syncPreference);
    window.addEventListener(THEME_CHANGE_EVENT, syncToggle);
    return () => {
      system.removeEventListener("change", syncPreference);
      window.removeEventListener("storage", syncPreference);
      window.removeEventListener(THEME_CHANGE_EVENT, syncToggle);
    };
  }, []);

  function handleToggle(): void {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // Keep the current-page choice even when it cannot be persisted.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="theme-toggle"
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      title="Toggle dark mode"
      onClick={handleToggle}
    >
      <Moon className="theme-moon" aria-hidden="true" />
      <Sun className="theme-sun" aria-hidden="true" />
    </Button>
  );
}
