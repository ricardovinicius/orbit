import { SessionBoundary } from "@/features/auth/components/session-boundary";
import { requireUser } from "@/features/auth/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  await requireUser();
  return <SessionBoundary>{children}</SessionBoundary>;
}
