"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { browserSupabase } from "@/lib/supabase/browser";

export function SessionBoundary({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    function hide(): void {
      if (container.current) container.current.style.visibility = "hidden";
    }
    function show(event: PageTransitionEvent): void {
      if (event.persisted) {
        hide();
        window.location.reload();
      }
    }
    function refresh(): void {
      if (document.visibilityState === "visible") router.refresh();
    }
    const { data } = browserSupabase().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        hide();
        window.location.replace(
          `/auth?${new URLSearchParams({ next: window.location.pathname + window.location.search, error: "session" })}`,
        );
      }
    });
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", show);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", show);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  return <div ref={container}>{children}</div>;
}
