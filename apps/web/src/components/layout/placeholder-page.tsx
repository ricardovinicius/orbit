import { Orbit } from "lucide-react";
import type { ReactElement } from "react";
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
}: {
  title: string;
  description: string;
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
    </PageContainer>
  );
}
