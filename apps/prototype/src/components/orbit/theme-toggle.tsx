"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const storageKey = "orbit-theme";

export function ThemeToggle() {
  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    function syncTheme() {
      let saved: string | null = null;
      try { saved = localStorage.getItem(storageKey); } catch { /* Storage may be unavailable. */ }
      document.documentElement.classList.toggle("dark", saved === "dark" || (saved !== "light" && system.matches));
    }
    system.addEventListener("change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      system.removeEventListener("change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  return (
    <Button variant="ghost" size="icon" className="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode" onClick={() => {
      const dark = document.documentElement.classList.toggle("dark");
      try { localStorage.setItem(storageKey, dark ? "dark" : "light"); } catch { /* The toggle still works without persistence. */ }
    }}>
      <Moon className="theme-moon" aria-hidden="true" />
      <Sun className="theme-sun" aria-hidden="true" />
    </Button>
  );
}
