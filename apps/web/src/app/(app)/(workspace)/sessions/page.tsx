import type { ReactElement } from "react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function Page(): ReactElement {
  return (
    <PlaceholderPage
      title="Sessions"
      description="A place to review the time you spend."
    />
  );
}
