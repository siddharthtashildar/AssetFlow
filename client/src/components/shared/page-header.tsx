import type { ReactNode } from "react";

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b bg-background/50 px-4 md:px-6 py-5">
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight truncate">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 md:px-6 py-6 space-y-6 ${className}`}>{children}</div>;
}
