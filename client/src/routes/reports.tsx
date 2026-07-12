import { createFileRoute } from "@tanstack/react-router";
import { Download, Filter, Calendar } from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar,
} from "recharts";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { utilizationData, maintenanceTrends, bookingTrends, departmentAllocation } from "@/lib/mock-data";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics · AssetFlow" }] }),
  component: Reports,
});

const C = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#ec4899", "#8b5cf6", "#14b8a6", "#f43f5e"];

const conditionData = [
  { name: "Excellent", value: 528 },
  { name: "Good", value: 412 },
  { name: "Fair", value: 186 },
  { name: "Poor", value: 34 },
];

const heatmap = Array.from({ length: 7 }, (_, day) => ({
  day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day],
  values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 40)),
}));

function Reports() {
  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="Real-time insights across assets, bookings, maintenance and audits."
        actions={
          <>
            <Select defaultValue="30d">
              <SelectTrigger className="w-[140px] h-9"><Calendar className="h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last quarter</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Filter />Filters</Button>
            <Button size="sm"><Download />Export</Button>
          </>
        }
      />
      <PageBody>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Asset Utilization" desc="Trailing 7 months">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={utilizationData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C[0]} stopOpacity={0.4} /><stop offset="100%" stopColor={C[0]} stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="allocated" stroke={C[0]} strokeWidth={2} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Maintenance Trends" desc="Opened vs resolved · 8 weeks">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={maintenanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis dataKey="week" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="opened" stroke={C[2]} strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" stroke={C[1]} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Department Allocation" desc="Assets per department">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={departmentAllocation} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} horizontal={false} />
                    <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={110} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                    <Bar dataKey="value" fill={C[0]} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Condition Distribution" desc="Overall asset health">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={conditionData} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3} label>
                      {conditionData.map((_, i) => <Cell key={i} fill={C[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title="Booking Heatmap" desc="Activity by day and hour">
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-[60px_repeat(12,minmax(0,1fr))] gap-1 text-[10px]">
                    <div />
                    {Array.from({ length: 12 }).map((_, i) => <div key={i} className="text-center text-muted-foreground tabular-nums">{i + 7}h</div>)}
                    {heatmap.map((row) => (
                      <div key={row.day} className="contents">
                        <div className="text-muted-foreground text-right pr-2 flex items-center justify-end">{row.day}</div>
                        {row.values.map((v, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded"
                            style={{ background: `color-mix(in oklab, var(--primary) ${Math.min(90, v * 2.4)}%, transparent)` }}
                            title={`${v} bookings`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ChartCard>
          </TabsContent>

          <TabsContent value="assets" className="mt-4">
            <ChartCard title="Asset Utilization" desc="Deep dive across categories">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="allocated" stackId="a" fill={C[0]} />
                  <Bar dataKey="available" stackId="a" fill={C[3]} />
                  <Bar dataKey="maintenance" stackId="a" fill={C[2]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          <TabsContent value="maintenance" className="mt-4">
            <ChartCard title="Maintenance Volume" desc="Weekly opened vs resolved">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={maintenanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="week" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="opened" stroke={C[2]} fill={C[2]} fillOpacity={0.2} />
                  <Area type="monotone" dataKey="resolved" stroke={C[1]} fill={C[1]} fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          <TabsContent value="bookings" className="mt-4">
            <ChartCard title="Booking Trends" desc="Bookings per day of week">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="day" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="bookings" fill={C[0]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          <TabsContent value="departments" className="mt-4">
            <ChartCard title="Department Asset Split" desc="Share of total inventory">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={departmentAllocation} dataKey="value" nameKey="name" outerRadius={110} label>
                    {departmentAllocation.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

function ChartCard({ title, desc, children }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
