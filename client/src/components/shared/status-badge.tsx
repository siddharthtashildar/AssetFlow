import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  available: "bg-success/12 text-success ring-success/20",
  allocated: "bg-info/12 text-info ring-info/20",
  maintenance: "bg-warning/15 text-warning ring-warning/25",
  retired: "bg-muted text-muted-foreground ring-border",
  active: "bg-success/12 text-success ring-success/20",
  "on-leave": "bg-warning/15 text-warning ring-warning/25",
  pending: "bg-muted text-foreground ring-border",
  approved: "bg-info/12 text-info ring-info/20",
  assigned: "bg-primary/12 text-primary ring-primary/20",
  "in-progress": "bg-warning/15 text-warning ring-warning/25",
  resolved: "bg-success/12 text-success ring-success/20",
  confirmed: "bg-success/12 text-success ring-success/20",
  conflict: "bg-destructive/12 text-destructive ring-destructive/20",
  completed: "bg-success/12 text-success ring-success/20",
  scheduled: "bg-info/12 text-info ring-info/20",
  excellent: "bg-success/12 text-success ring-success/20",
  good: "bg-info/12 text-info ring-info/20",
  fair: "bg-warning/15 text-warning ring-warning/25",
  poor: "bg-destructive/12 text-destructive ring-destructive/20",
  critical: "bg-destructive/15 text-destructive ring-destructive/25",
  high: "bg-destructive/12 text-destructive ring-destructive/20",
  medium: "bg-warning/15 text-warning ring-warning/25",
  low: "bg-muted text-muted-foreground ring-border",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const key = value.toLowerCase();
  const cls = map[key] || "bg-muted text-muted-foreground ring-border";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize", cls, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value.replace(/-/g, " ")}
    </span>
  );
}
