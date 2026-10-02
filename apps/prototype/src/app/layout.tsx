import type { Metadata } from "next";
import "./globals.css";
import "@fontsource-variable/geist";
import { WorkspaceProvider } from "@/components/orbit/workspace";

// Apply the saved preference before paint to avoid flashing the light theme.
const themeScript = `(function(){var theme;try{theme=localStorage.getItem("orbit-theme")}catch(e){}document.documentElement.classList.toggle("dark",theme==="dark"||(theme!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches))})();`;

export const metadata: Metadata = {
  title: "Orbit Prototype",
  description: "Mock-data UI prototype for Orbit.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><WorkspaceProvider>{children}</WorkspaceProvider></body>
    </html>
  );
}
