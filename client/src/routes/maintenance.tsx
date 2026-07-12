import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter, MessageSquare, Paperclip, Clock, Wrench } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { maintenanceRequests } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance · AssetFlow" }] }),
  component: Maintenance,
});

const columns = [
  { key: "pending", title: "Pending", tone: "bg-muted-foreground/60" },
  { key: "approved", title: "Approved", tone: "bg-info" },
  { key: "assigned", title: "Technician Assigned", tone: "bg-primary" },
  { key: "in-progress", title: "In Progress", tone: "bg-warning" },
  { key: "resolved", title: "Resolved", tone: "bg-success" },
];

function initials(n: string) { return n.split(" ").map((s) => s[0]).slice(0, 2).join(""); }

function Maintenance() {
  return (
    <>
      <PageHeader
        title="Maintenance Board"
        description="Track every maintenance request from intake through resolution."
        actions={<><Button variant="outline" size="sm"><Filter />Filter</Button><Button size="sm"><Plus />New request</Button></>}
      />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatMini label="Open tickets" value="14" trend="+3" icon={Wrench} tone="warning" />
          <StatMini label="Avg. resolution" value="1.8d" trend="-0.4d" icon={Clock} tone="success" />
          <StatMini label="SLA met" value="94%" trend="+2%" icon={Wrench} tone="success" />
          <StatMini label="Critical open" value="1" trend="—" icon={Wrench} tone="danger" />
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-5">
          {columns.map((col) => {
            const items = maintenanceRequests.filter((r) => r.status === col.key);
            return (
              <div key={col.key} className="flex flex-col rounded-lg border bg-muted/20 min-h-[400px]">
                <div className="flex items-center justify-between p-3 border-b bg-background/70 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", col.tone)} />
                    <h3 className="text-sm font-semibold">{col.title}</h3>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{items.length}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="flex-1 space-y-2 p-2">
                  {items.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-8">No tickets</div>
                  )}
                  {items.map((t) => (
                    <Card key={t.id} className="p-3 hover:shadow-elevated cursor-pointer transition-all hover:-translate-y-0.5">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] font-mono text-muted-foreground">{t.id}</span>
                        <StatusBadge value={t.priority} />
                      </div>
                      <p className="text-sm font-medium leading-tight line-clamp-2">{t.issue}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground truncate">{t.asset}</p>
                      <div className="mt-2 flex items-center justify-between border-t pt-2">
                        <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px] bg-muted">{initials(t.requester)}</AvatarFallback></Avatar>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{t.comments}</span>
                          <span className="flex items-center gap-0.5"><Paperclip className="h-3 w-3" />{t.id.slice(-1)}</span>
                          <span>{t.created}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}

function StatMini({ label, value, trend, icon: Icon, tone }: any) {
  const tones: any = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/10 text-destructive",
    default: "bg-primary/10 text-primary",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{trend} this week</p>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tones[tone] || tones.default)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
