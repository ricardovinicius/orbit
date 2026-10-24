import type { Metadata } from "next";
import { themeInitializationScript } from "@/lib/theme";
import "@fontsource-variable/geist";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit",
  description: "Orbit personal planning workspace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script>{themeInitializationScript}</script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
