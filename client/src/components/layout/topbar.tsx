import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Search, Moon, Sun, Command as CommandIcon, ChevronRight, LogOut, User, CreditCard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/lib/theme";
import { notifications } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  departments: "Departments",
  categories: "Asset Categories",
  employees: "Employees",
  assets: "Assets",
  register: "Register",
  allocations: "Allocation & Transfers",
  bookings: "Bookings",
  maintenance: "Maintenance",
  audits: "Audits",
  reports: "Reports & Analytics",
  notifications: "Notifications",
  settings: "Settings",
};

function Breadcrumbs() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const segs = pathname.split("/").filter(Boolean);
  return (
    <nav className="hidden md:flex items-center gap-1.5 text-sm">
      <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
      {segs.map((s, i) => {
        const to = "/" + segs.slice(0, i + 1).join("/");
        const isLast = i === segs.length - 1;
        return (
          <span key={to} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-medium text-foreground">{routeLabels[s] ?? s}</span>
            ) : (
              <Link to={to as any} className="text-muted-foreground hover:text-foreground transition-colors">
                {routeLabels[s] ?? s}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function Topbar({ onCommand }: { onCommand: () => void }) {
  const { theme, toggle } = useTheme();
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 px-3 md:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <button
          onClick={onCommand}
          className="hidden md:flex items-center gap-2 h-9 w-64 lg:w-80 rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search anything…</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
            <CommandIcon className="h-3 w-3" />K
          </kbd>
        </button>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onCommand}>
          <Search className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[380px] p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <div className="text-sm font-semibold">Notifications</div>
                <div className="text-xs text-muted-foreground">{unread} unread</div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs">Mark all read</Button>
            </div>
            <ScrollArea className="h-[360px]">
              <div className="divide-y">
                {notifications.slice(0, 6).map((n) => (
                  <div key={n.id} className="flex gap-3 p-3 hover:bg-muted/40 transition-colors">
                    <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-primary" : "bg-transparent"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        {n.priority === "high" && <Badge variant="destructive" className="h-4 px-1 text-[9px]">High</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t p-2">
              <Link to="/notifications">
                <Button variant="ghost" size="sm" className="w-full text-xs">View all notifications</Button>
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-muted transition-colors pl-1 pr-2 py-1">
              <Avatar className="h-7 w-7">
                <AvatarImage src="" />
                <AvatarFallback className="text-[11px] bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">AS</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-medium">Aarav Sharma</div>
                <div className="text-[10px] text-muted-foreground">Admin</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Aarav Sharma</span>
                <span className="text-xs text-muted-foreground font-normal">aarav@assetflow.io</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem><User className="h-4 w-4" />Profile</DropdownMenuItem>
              <DropdownMenuItem><CreditCard className="h-4 w-4" />Billing</DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings"><User className="h-4 w-4" />Settings</Link></DropdownMenuItem>
              <DropdownMenuItem><HelpCircle className="h-4 w-4" />Help & Support</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/login" className="w-full cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
