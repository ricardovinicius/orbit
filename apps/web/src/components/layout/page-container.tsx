import { Orbit } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

export function PageContainer({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div className="page-container">
      {children}
      <footer className="page-footer">
        <span>
          <Orbit aria-hidden="true" /> A little intention goes a long way.
        </span>
      </footer>
    </div>
  );
}
