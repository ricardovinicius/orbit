import type { Metadata } from "next";
import { Suspense } from "react";
import "@fontsource-variable/geist";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit",
  description: "Orbit personal planning workspace.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">): React.JSX.Element {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={
            <p role="status" className="p-6">
              Loading Orbit…
            </p>
          }
        >
          {children}
        </Suspense>
      </body>
    </html>
  );
}
