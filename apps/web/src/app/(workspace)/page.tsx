import type { ReactElement } from "react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function Page(): ReactElement {
  return (
    <PlaceholderPage
      title="Today"
      description="A little clarity for the day ahead."
    />
  );
}
