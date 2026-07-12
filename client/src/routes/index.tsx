import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Package, PackageCheck, Wrench, CalendarDays, RotateCw, ArrowLeftRight,
  PlusSquare, ArrowUpRight, Sparkles, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getCurrentUser, getDepartments, getDashboardStats } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard · AssetFlow" }] }),
  component: Dashboard,
});

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
const C = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#ec4899", "#8b5cf6", "#14b8a6", "#f43f5e"];

function Dashboard() {
  const currentUser = getCurrentUser();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  const { data: realDepartments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const departmentAllocation = realDepartments
    .map((d) => ({ name: d.name, value: d._count?.assets || 0 }))
    .filter(d => d.value > 0); // only show those with assets

  const formatDaysRemaining = (expectedReturnDate: string | null) => {
    if (!expectedReturnDate) return "N/A";
    const diff = new Date(expectedReturnDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `in ${days} days`;
    if (days === 0) return "today";
    return `${Math.abs(days)} days overdue`;
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RotateCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const kpi = stats?.kpi ?? {
    available: 0,
    allocated: 0,
    maintenance: 0,
    activeBookings: 0,
    upcomingReturns: 0,
    pendingTransfers: 0,
  };

  const utilizationData = stats?.utilizationData ?? [];
  const maintenanceTrends = stats?.maintenanceTrends ?? [];
  const bookingTrends = stats?.bookingTrends ?? [];
  const recentAssets = stats?.recentAssets ?? [];
  const recentMaint = stats?.recentMaintenance ?? [];
  const upcomingReturns = stats?.upcomingReturns ?? [];
  const listNotifications = stats?.notifications ?? [];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${currentUser?.name?.split(" ")[0] ?? "Guest"}`}
        description="Here's a live snapshot of your organization's assets, bookings and maintenance activity."
        actions={
          <>
            <Button variant="outline" size="sm" asChild><Link to="/reports">View reports</Link></Button>
            <Button size="sm" asChild><Link to="/assets/register"><PlusSquare />Register asset</Link></Button>
          </>
        }
      />
      <PageBody>
        {/* KPI Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Available" value={String(kpi.available)} delta={4.2} icon={Package} tone="success" />
          <StatCard label="Allocated" value={String(kpi.allocated)} delta={2.1} icon={PackageCheck} tone="info" />
          <StatCard label="Maintenance" value={String(kpi.maintenance)} delta={-8.4} icon={Wrench} tone="warning" />
          <StatCard label="Active Bookings" value={String(kpi.activeBookings)} delta={12.6} icon={CalendarDays} tone="default" />
          <StatCard label="Upcoming Returns" value={String(kpi.upcomingReturns)} delta={-3.1} icon={RotateCw} tone="info" />
          <StatCard label="Pending Transfers" value={String(kpi.pendingTransfers)} delta={1.4} icon={ArrowLeftRight} tone="warning" />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Asset Utilization</CardTitle>
                <CardDescription>Available vs allocated vs maintenance — trailing 7 months</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1 font-medium"><TrendingUp className="h-3 w-3" />+6.4%</Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={utilizationData}>
                  <defs>
                    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C[3]} stopOpacity={0.35} /><stop offset="100%" stopColor={C[3]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C[0]} stopOpacity={0.35} /><stop offset="100%" stopColor={C[0]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C[2]} stopOpacity={0.35} /><stop offset="100%" stopColor={C[2]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="allocated" stroke={C[0]} strokeWidth={2} fill="url(#gB)" />
                  <Area type="monotone" dataKey="available" stroke={C[3]} strokeWidth={2} fill="url(#gA)" />
                  <Area type="monotone" dataKey="maintenance" stroke={C[2]} strokeWidth={2} fill="url(#gC)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Department Allocation</CardTitle>
              <CardDescription>Assets distribution across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={departmentAllocation} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {departmentAllocation.map((_, i) => (<Cell key={i} fill={C[i % C.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {departmentAllocation.slice(0, 6).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: C[i % C.length] }} />
                    <span className="truncate text-muted-foreground">{d.name}</span>
                    <span className="ml-auto font-medium tabular-nums">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Maintenance Trends</CardTitle>
              <CardDescription>Requests opened vs resolved — last 8 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={maintenanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="opened" stroke={C[2]} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="resolved" stroke={C[1]} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Booking Activity</CardTitle>
              <CardDescription>Resource bookings this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="bookings" fill={C[0]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent activity</CardTitle>
                <CardDescription>Latest movements across your workspace</CardDescription>
              </div>
              <Tabs defaultValue="assets" className="hidden sm:block">
                <TabsList className="h-8">
                  <TabsTrigger value="assets" className="text-xs">Assets</TabsTrigger>
                  <TabsTrigger value="maint" className="text-xs">Maintenance</TabsTrigger>
                  <TabsTrigger value="returns" className="text-xs">Returns</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="assets">
                <TabsContent value="assets" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAssets.map((a) => (
                        <TableRow key={a.id} className="hover:bg-muted/40">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-lg">{a.image}</div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{a.name}</div>
                                <div className="text-[11px] text-muted-foreground font-mono">{a.tag}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{a.assignee ?? <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell><StatusBadge value={a.status} /></TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">{a.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="maint" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentMaint.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-mono text-xs">{m.id}</TableCell>
                          <TableCell className="text-sm">{m.asset}</TableCell>
                          <TableCell><StatusBadge value={m.priority} /></TableCell>
                          <TableCell><StatusBadge value={m.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="returns" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Due</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingReturns.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="text-sm">{a.name}</TableCell>
                          <TableCell className="text-sm">{a.assignee}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDaysRemaining(a.expectedReturnDate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick actions + notifications */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="outline" className="justify-between h-auto py-3" asChild>
                  <Link to="/assets/register"><span className="flex items-center gap-3"><PlusSquare className="h-4 w-4" /><span className="flex flex-col items-start"><span className="text-sm font-medium">Register asset</span><span className="text-[11px] text-muted-foreground">Add new inventory item</span></span></span><ArrowUpRight className="h-4 w-4" /></Link>
                </Button>
                <Button variant="outline" className="justify-between h-auto py-3" asChild>
                  <Link to="/bookings"><span className="flex items-center gap-3"><CalendarDays className="h-4 w-4" /><span className="flex flex-col items-start"><span className="text-sm font-medium">Book a resource</span><span className="text-[11px] text-muted-foreground">Reserve room, vehicle, gear</span></span></span><ArrowUpRight className="h-4 w-4" /></Link>
                </Button>
                <Button variant="outline" className="justify-between h-auto py-3" asChild>
                  <Link to="/maintenance"><span className="flex items-center gap-3"><Wrench className="h-4 w-4" /><span className="flex flex-col items-start"><span className="text-sm font-medium">Raise maintenance</span><span className="text-[11px] text-muted-foreground">Open a ticket</span></span></span><ArrowUpRight className="h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Latest notifications</CardTitle>
                <Link to="/notifications" className="text-xs text-primary hover:underline">View all</Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {listNotifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="flex gap-3">
                    <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{n.type.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
