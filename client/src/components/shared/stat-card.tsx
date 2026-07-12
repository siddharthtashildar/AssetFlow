import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, delta, deltaLabel, icon: Icon, tone = "default",
}: {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  };
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="p-5 hover:shadow-elevated transition-shadow border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
            up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground truncate">{deltaLabel ?? "vs last month"}</span>
        </div>
      )}
    </Card>
  );
}
