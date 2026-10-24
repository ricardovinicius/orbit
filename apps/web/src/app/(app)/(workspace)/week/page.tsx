import type { ReactElement } from "react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function Page(): ReactElement {
  return (
    <PlaceholderPage
      title="Week"
      description="Make room for what matters this week."
    />
  );
}
