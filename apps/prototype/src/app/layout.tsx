import type { Metadata } from "next";
import "./globals.css";
import "@fontsource-variable/geist";
import { WorkspaceProvider } from "@/components/orbit/workspace";

export const metadata: Metadata = {
  title: "Orbit Prototype",
  description: "Mock-data UI prototype for Orbit.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><WorkspaceProvider>{children}</WorkspaceProvider></body>
    </html>
  );
}
