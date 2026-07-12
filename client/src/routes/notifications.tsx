import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Filter, Wrench, CalendarDays, ClipboardCheck, ArrowLeftRight, PackageCheck, ShieldAlert } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications · AssetFlow" }] }),
  component: Notifications,
});

const iconMap: any = {
  maintenance: Wrench, booking: CalendarDays, audit: ClipboardCheck,
  transfer: ArrowLeftRight, allocation: PackageCheck, warranty: ShieldAlert,
};

function Notifications() {
  const groups: Record<string, typeof notifications> = {};
  notifications.forEach((n) => {
    const key = n.time.includes("min") || n.time.includes("hr") ? "Today" : n.time === "Yesterday" ? "Yesterday" : "Earlier";
    (groups[key] ||= []).push(n);
  });

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Everything happening across your assets, bookings and audits."
        actions={
          <>
            <Button variant="outline" size="sm"><Filter />Filter</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("All notifications marked as read")}><Check />Mark all read</Button>
          </>
        }
      />
      <PageBody>
        <Card>
          <div className="flex items-center justify-between border-b p-3">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px]">{notifications.length}</Badge></TabsTrigger>
                <TabsTrigger value="unread">Unread <Badge className="ml-2 h-4 px-1.5 text-[10px]">{notifications.filter((n) => n.unread).length}</Badge></TabsTrigger>
                <TabsTrigger value="mentions">Mentions</TabsTrigger>
                <TabsTrigger value="priority">High priority</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardContent className="p-0">
            {Object.entries(groups).map(([label, items]) => (
              <div key={label}>
                <div className="sticky top-14 z-10 border-b bg-background/90 backdrop-blur px-4 py-2 text-[11px] font-medium uppercase text-muted-foreground tracking-wide">{label}</div>
                <div className="divide-y">
                  {items.map((n) => {
                    const Icon = iconMap[n.type] || Bell;
                    return (
                      <div key={n.id} className={cn("flex gap-4 p-4 hover:bg-muted/30 transition-colors", n.unread && "bg-primary/[0.03]")}>
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          n.priority === "high" ? "bg-destructive/10 text-destructive" :
                          n.priority === "medium" ? "bg-warning/15 text-warning" :
                          "bg-primary/10 text-primary",
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">{n.title}</p>
                            {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                            {n.priority === "high" && <Badge variant="destructive" className="h-4 text-[9px]">High</Badge>}
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                          <p className="mt-1.5 text-[11px] text-muted-foreground">{n.time}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-xs">View</Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
