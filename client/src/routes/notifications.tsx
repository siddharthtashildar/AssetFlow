import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Filter, Wrench, CalendarDays, ClipboardCheck, ArrowLeftRight, PackageCheck, ShieldAlert } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../lib/api";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications · AssetFlow" }] }),
  component: Notifications,
});

const iconMap: any = {
  maintenance: Wrench,
  booking: CalendarDays,
  audit: ClipboardCheck,
  transfer: ArrowLeftRight,
  allocation: PackageCheck,
  warranty: ShieldAlert,
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function mapType(type: string): string {
  switch (type) {
    case "ASSET_ASSIGNED": return "allocation";
    case "BOOKING": return "booking";
    case "MAINTENANCE": return "maintenance";
    case "TRANSFER": return "transfer";
    case "RETURN_OVERDUE": return "warranty";
    case "AUDIT": return "audit";
    default: return "notification";
  }
}

function Notifications() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch notifications
  const { data: dbNotifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
  });

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to mark all as read");
    },
  });

  // Mark single read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to mark notification as read");
    },
  });

  const handleMarkAllRead = () => {
    if (dbNotifications.filter((n) => !n.isRead).length === 0) {
      toast.info("No unread notifications");
      return;
    }
    markAllReadMutation.mutate();
  };

  const handleMarkSingleRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const mappedNotifications = dbNotifications.map((n) => {
    const isUrgent = n.title.toLowerCase().includes("urgent") ||
                     n.title.toLowerCase().includes("critical") ||
                     n.message.toLowerCase().includes("overdue");
    return {
      id: n.id,
      type: mapType(n.type),
      title: n.title,
      body: n.message,
      unread: !n.isRead,
      priority: isUrgent ? "high" : n.type === "AUDIT" ? "medium" : "low",
      time: formatTimeAgo(n.createdAt),
      link: n.link,
    };
  });

  const filteredNotifications = mappedNotifications.filter((n) => {
    if (activeTab === "unread") return n.unread;
    if (activeTab === "priority") return n.priority === "high";
    return true; // "all" and "mentions" (mentions default to all)
  });

  const groups: Record<string, typeof mappedNotifications> = {};
  filteredNotifications.forEach((n) => {
    const key = n.time.includes("min") || n.time.includes("hr") || n.time === "Just now" ? "Today" : n.time === "Yesterday" ? "Yesterday" : "Earlier";
    (groups[key] ||= []).push(n);
  });

  const unreadCount = dbNotifications.filter((n) => !n.isRead).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Everything happening across your assets, bookings and audits."
        actions={
          <>
            <Button variant="outline" size="sm"><Filter />Filter</Button>
            <Button size="sm" variant="outline" onClick={handleMarkAllRead} disabled={markAllReadMutation.isPending}><Check />Mark all read</Button>
          </>
        }
      />
      <PageBody>
        <Card>
          <div className="flex items-center justify-between border-b p-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px]">{mappedNotifications.length}</Badge></TabsTrigger>
                <TabsTrigger value="unread">Unread <Badge className="ml-2 h-4 px-1.5 text-[10px] bg-primary text-primary-foreground">{unreadCount}</Badge></TabsTrigger>
                <TabsTrigger value="mentions">Mentions</TabsTrigger>
                <TabsTrigger value="priority">High priority</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground text-sm">Loading notifications...</p>
              </div>
            ) : Object.keys(groups).length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center p-6 border-dashed border-2 m-4 rounded-lg bg-muted/10">
                <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground text-sm font-medium">No notifications found</p>
                <p className="text-muted-foreground/60 text-xs text-center mt-1">You are all caught up!</p>
              </div>
            ) : (
              Object.entries(groups).map(([label, items]) => (
                <div key={label}>
                  <div className="sticky top-14 z-10 border-b bg-background/90 backdrop-blur px-4 py-2 text-[11px] font-medium uppercase text-muted-foreground tracking-wide">{label}</div>
                  <div className="divide-y">
                    {items.map((n) => {
                      const Icon = iconMap[n.type] || Bell;
                      return (
                        <div
                          key={n.id}
                          onClick={() => n.unread && handleMarkSingleRead(n.id)}
                          className={cn(
                            "flex gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer group relative",
                            n.unread && "bg-primary/[0.03]"
                          )}
                        >
                          <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            n.priority === "high" ? "bg-destructive/10 text-destructive" :
                            n.priority === "medium" ? "bg-warning/15 text-warning" :
                            "bg-primary/10 text-primary"
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
                          {n.unread && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 text-xs absolute right-4 top-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkSingleRead(n.id);
                              }}
                            >
                              Mark read
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
