import type { ReactElement, ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}): ReactElement {
  return (
    <header className="page-header">
      <div className="min-w-0 flex-1">
        <h1>{title}</h1>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
