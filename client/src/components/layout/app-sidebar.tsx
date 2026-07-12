import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, Boxes, Users, Package, PlusSquare, ArrowLeftRight,
  CalendarDays, Wrench, ClipboardCheck, BarChart3, Bell, Settings as SettingsIcon,
  Sparkles, ChevronRight,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub,
  SidebarMenuSubButton, SidebarMenuSubItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const nav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  {
    title: "Organization",
    icon: Building2,
    children: [
      { title: "Departments", url: "/departments" },
      { title: "Asset Categories", url: "/categories" },
      { title: "Employees", url: "/employees" },
    ],
  },
  {
    title: "Assets",
    icon: Package,
    children: [
      { title: "Asset Directory", url: "/assets", icon: Boxes },
      { title: "Register Asset", url: "/assets/register", icon: PlusSquare },
      { title: "Allocation & Transfers", url: "/assets/allocations", icon: ArrowLeftRight },
    ],
  },
  { title: "Bookings", url: "/bookings", icon: CalendarDays },
  { title: "Maintenance", url: "/maintenance", icon: Wrench, badge: "9" },
  { title: "Audits", url: "/audits", icon: ClipboardCheck },
  { title: "Reports & Analytics", url: "/reports", icon: BarChart3 },
];

const secondary = [
  { title: "Notifications", url: "/notifications", icon: Bell, badge: "3" },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/"));

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tracking-tight truncate">AssetFlow</span>
              <span className="text-[10px] text-muted-foreground truncate">Enterprise ERP · v2.4</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                if (!item.children) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url!)} tooltip={item.title}>
                        <Link to={item.url!}>
                          <item.icon />
                          <span>{item.title}</span>
                          {item.badge && !collapsed && (
                            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] font-medium">{item.badge}</Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                const anyActive = item.children.some((c) => isActive(c.url));
                return (
                  <Collapsible key={item.title} defaultOpen={anyActive} asChild className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} isActive={anyActive && collapsed}>
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((c) => (
                            <SidebarMenuSubItem key={c.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(c.url)}>
                                <Link to={c.url}>
                                  <span>{c.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && !collapsed && (
                        <Badge className="ml-auto h-5 px-1.5 text-[10px] bg-primary text-primary-foreground">{item.badge}</Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="rounded-lg bg-gradient-to-br from-primary/8 to-primary/4 border border-primary/15 p-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Upgrade to Pro</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Advanced audits, AI insights & unlimited assets.
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
