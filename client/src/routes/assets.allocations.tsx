import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeftRight, PackageCheck, RotateCw, Clock, CheckCircle2, XCircle,
  User, MapPin, Plus, AlertTriangle,
} from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { toast } from "sonner";

export const Route = createFileRoute("/assets/allocations")({
  head: () => ({ meta: [{ title: "Allocation & Transfers · AssetFlow" }] }),
  component: Allocations,
});

const workflows = [
  { key: "allocate", title: "Allocate asset", desc: "Assign an available asset to an employee", icon: PackageCheck, tone: "text-success bg-success/10" },
  { key: "transfer", title: "Transfer asset", desc: "Move asset between employees or departments", icon: ArrowLeftRight, tone: "text-info bg-info/10" },
  { key: "return", title: "Return asset", desc: "Employee returns asset to inventory", icon: RotateCw, tone: "text-warning bg-warning/15" },
];

const pending = [
  { id: "REQ-3021", type: "Allocate", asset: "MacBook Pro 16\" M3 Max", tag: "AF-2024031", from: "Inventory", to: "Priya Raghavan", dept: "Engineering", status: "pending", raised: "3h ago" },
  { id: "REQ-3020", type: "Transfer", asset: "Dell UltraSharp 32\" 4K", tag: "AF-2024018", from: "Marcus Whitfield", to: "Kenji Tanaka", dept: "Product Design", status: "approved", raised: "6h ago" },
  { id: "REQ-3019", type: "Return", asset: "iPhone 15 Pro", tag: "AF-2024047", from: "Rahul Verma", to: "Inventory", dept: "People & Culture", status: "in-progress", raised: "1d ago" },
  { id: "REQ-3018", type: "Transfer", asset: "Tesla Model 3", tag: "AF-2024061", from: "SF Fleet", to: "Berlin Hub", dept: "Operations", status: "pending", raised: "1d ago" },
  { id: "REQ-3017", type: "Allocate", asset: "Framework Laptop 16", tag: "AF-2024058", from: "Inventory", to: "Zoe Nakamura", dept: "Sales & Growth", status: "approved", raised: "2d ago" },
];

const timeline = [
  { icon: Plus, label: "Request raised", by: "Priya Raghavan", time: "3h ago", color: "text-primary bg-primary/10" },
  { icon: CheckCircle2, label: "Approved by Manager", by: "Amelia Chen", time: "2h ago", color: "text-success bg-success/10" },
  { icon: Clock, label: "Waiting for asset handover", by: "IT Ops", time: "Now", color: "text-warning bg-warning/15" },
  { icon: XCircle, label: "Not yet delivered", by: "—", time: "—", color: "text-muted-foreground bg-muted" },
];

function Allocations() {
  return (
    <>
      <PageHeader
        title="Allocation & Transfers"
        description="Manage asset assignments, transfers, and returns with approval workflows."
        actions={<Button size="sm"><Plus />New request</Button>}
      />
      <PageBody>
        {/* Workflow cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {workflows.map((w) => (
            <Card key={w.key} className="group cursor-pointer hover:shadow-elevated transition-all hover:-translate-y-0.5">
              <CardHeader>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${w.tone}`}>
                  <w.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base mt-3">{w.title}</CardTitle>
                <CardDescription>{w.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info(`${w.title} workflow started`)}>Start workflow</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conflict warning */}
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">2 conflicts detected</p>
              <p className="text-xs text-muted-foreground">Asset AF-2024031 has an active booking overlapping the requested allocation window. Review before approving.</p>
            </div>
            <Button size="sm" variant="outline">Review conflicts</Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          {/* Requests list */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Active requests</CardTitle>
                  <CardDescription>Pending, in progress and recently approved</CardDescription>
                </div>
                <Tabs defaultValue="all">
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="mine" className="text-xs">Mine</TabsTrigger>
                    <TabsTrigger value="approvals" className="text-xs">Needs approval</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map((r) => (
                <div key={r.id} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {r.type === "Allocate" ? <PackageCheck className="h-4 w-4" /> : r.type === "Transfer" ? <ArrowLeftRight className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{r.id}</span>
                      <Badge variant="secondary" className="h-5 text-[10px]">{r.type}</Badge>
                      <StatusBadge value={r.status} />
                    </div>
                    <p className="text-sm font-medium truncate mt-1">{r.asset}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      <span className="font-mono">{r.tag}</span> · {r.from} → {r.to} · {r.dept}
                    </p>
                  </div>
                  <div className="hidden md:block text-right text-xs text-muted-foreground shrink-0">{r.raised}</div>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Approved ${r.id}`)}>Review</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Approval timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approval timeline</CardTitle>
              <CardDescription>REQ-3021 — MacBook Pro 16"</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-muted/30 p-3 mb-4 space-y-2">
                <div className="flex items-center gap-2 text-xs"><User className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Assignee:</span><span className="font-medium">Priya Raghavan</span></div>
                <div className="flex items-center gap-2 text-xs"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Location:</span><span className="font-medium">HQ - Floor 3</span></div>
                <div className="flex items-center gap-2 text-xs"><PackageCheck className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Condition:</span><span className="font-medium">Excellent</span></div>
              </div>
              <ol className="relative space-y-4 pl-2">
                {timeline.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${t.color} shrink-0`}>
                        <t.icon className="h-3.5 w-3.5" />
                      </div>
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-2 min-w-0">
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.by} · {t.time}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.error("Request rejected")}>Reject</Button>
                <Button size="sm" onClick={() => toast.success("Request approved")}>Approve</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
