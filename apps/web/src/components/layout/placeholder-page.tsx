import { Orbit } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";

export function PlaceholderPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}): ReactElement {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />
      <Empty className="workspace-placeholder">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Orbit />
          </EmptyMedia>
          <EmptyTitle>This view is not available yet</EmptyTitle>
          <EmptyDescription>
            Use the navigation to explore your workspace.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      {children && <div className="mt-6">{children}</div>}
    </PageContainer>
  );
}
