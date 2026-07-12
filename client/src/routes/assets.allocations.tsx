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
<<<<<<< Updated upstream
=======
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "ASSET_MANAGER";

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Dialog open states
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);

  // Form states
  const [allocAssetId, setAllocAssetId] = useState("");
  const [allocUserId, setAllocUserId] = useState("");
  const [allocReturnDate, setAllocReturnDate] = useState("");

  const [transAllocId, setTransAllocId] = useState("");
  const [transUserId, setTransUserId] = useState("");

  const [returnAllocId, setReturnAllocId] = useState("");
  const [returnNotes, setReturnNotes] = useState("");

  // Queries
  const { data: dbAllocations = [] } = useQuery({
    queryKey: ["allocations"],
    queryFn: () => getAllocations(),
  });

  const { data: dbTransfers = [] } = useQuery({
    queryKey: ["transfers"],
    queryFn: () => getTransfers(),
  });

  const { data: dbAssets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => getAssets(),
  });

  const { data: dbUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

  // Mutations
  const allocateMutation = useMutation({
    mutationFn: createAllocation,
    onSuccess: () => {
      toast.success("Asset allocated successfully");
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setIsAllocateOpen(false);
      setAllocAssetId("");
      setAllocUserId("");
      setAllocReturnDate("");
    },
    onError: (err: any) => {
      toast.error("Allocation failed", { description: err.message });
    },
  });

  const transferMutation = useMutation({
    mutationFn: requestTransfer,
    onSuccess: () => {
      toast.success("Transfer request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      setIsTransferOpen(false);
      setTransAllocId("");
      setTransUserId("");
    },
    onError: (err: any) => {
      toast.error("Transfer failed", { description: err.message });
    },
  });

  const returnMutation = useMutation({
    mutationFn: requestReturn,
    onSuccess: () => {
      toast.success("Return request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setIsReturnOpen(false);
      setReturnAllocId("");
    },
    onError: (err: any) => {
      toast.error("Return request failed", { description: err.message });
    },
  });

  const processTransferMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "APPROVE" | "REJECT" }) => processTransfer(id, action),
    onSuccess: (_, variables) => {
      toast.success(`Transfer request ${variables.action.toLowerCase()}d`);
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (err: any) => {
      toast.error("Action failed", { description: err.message });
    },
  });

  const processReturnMutation = useMutation({
    mutationFn: ({ id, checkInNotes }: { id: string; checkInNotes?: string }) => completeReturn(id, checkInNotes),
    onSuccess: () => {
      toast.success("Return request approved and asset checked-in");
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (err: any) => {
      toast.error("Action failed", { description: err.message });
    },
  });

  // Derived lists
  const availableAssets = useMemo(() => {
    return dbAssets.filter((a) => a.status === "AVAILABLE");
  }, [dbAssets]);

  const activeAllocations = useMemo(() => {
    return dbAllocations.filter((a) => a.status === "ACTIVE" || a.status === "RETURN_REQUESTED");
  }, [dbAllocations]);

  const combinedRequests = useMemo(() => {
    const list: any[] = [];

    // Transfer requests - show as moving from current holder to new owner
    dbTransfers.forEach((t) => {
      list.push({
        id: t.id,
        dbId: t.id,
        type: "Transfer",
        asset: t.allocation?.asset?.name ?? "Unknown Asset",
        tag: t.allocation?.asset?.assetTag ?? "N/A",
        from: t.allocation?.user?.name ?? "N/A",
        to: t.targetUser?.name ?? "N/A",
        dept: "HQ - Operations",
        status: t.status.toLowerCase(), // "requested", "approved", "rejected"
        raised: new Date(t.createdAt).toLocaleDateString(),
        expectedReturnDate: t.allocation?.expectedReturnDate,
        raw: t,
      });
    });

    // Allocations showing return requests or active assignments
    // Filter out RETURNED allocations (fully back in inventory)
    dbAllocations.forEach((a) => {
      if (a.status === "RETURN_REQUESTED" || a.status === "ACTIVE") {
        list.push({
          id: a.id,
          dbId: a.id,
          type: a.status === "RETURN_REQUESTED" ? "Return" : "Allocate",
          asset: a.asset?.name ?? "Unknown Asset",
          tag: a.asset?.assetTag ?? "N/A",
          from: "Inventory",
          to: a.user?.name ?? "N/A",
          dept: a.asset?.location ?? "HQ - Storage",
          status: a.status === "RETURN_REQUESTED" ? "pending" : a.status.toLowerCase(),
          raised: new Date(a.createdAt).toLocaleDateString(),
          expectedReturnDate: a.expectedReturnDate,
          raw: a,
        });
      }
    });

    return list;
  }, [dbAllocations, dbTransfers]);

  const current = useMemo(() => {
    if (combinedRequests.length === 0) return null;
    return combinedRequests.find((r) => r.id === selectedId) || combinedRequests[0];
  }, [combinedRequests, selectedId]);

  const timeline = useMemo(() => {
    if (!current) return [];
    
    const steps: any[] = [];
    if (current.type === "Transfer") {
      steps.push({ icon: Plus, label: "Transfer request raised", by: current.from, time: current.raised, color: "text-primary bg-primary/10" });
      if (current.status === "approved") {
        steps.push({ icon: CheckCircle2, label: "Transfer approved", by: current.raw.approvedBy?.name ?? "Manager", time: "Processed", color: "text-success bg-success/10" });
      } else if (current.status === "rejected") {
        steps.push({ icon: XCircle, label: "Transfer rejected", by: current.raw.approvedBy?.name ?? "Manager", time: "Processed", color: "text-destructive bg-destructive/10" });
      } else {
        steps.push({ icon: Clock, label: "Waiting for Manager approval", by: "Asset Ops", time: "Now", color: "text-warning bg-warning/15" });
      }
    } else if (current.type === "Return") {
      steps.push({ icon: RotateCw, label: "Return requested", by: current.to, time: current.raised, color: "text-warning bg-warning/10" });
      if (current.raw.status === "RETURNED") {
        steps.push({ icon: CheckCircle2, label: "Return completed & verified", by: "Manager", time: "Checked-in", color: "text-success bg-success/10" });
      } else {
        steps.push({ icon: Clock, label: "Pending physical hand-over", by: "IT Warehouse", time: "Now", color: "text-warning bg-warning/15" });
      }
    } else {
      steps.push({ icon: PackageCheck, label: "Allocation active", by: current.to, time: current.raised, color: "text-success bg-success/10" });
    }
    return steps;
  }, [current]);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                  </li>
                ))}
              </ol>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.error("Request rejected")}>Reject</Button>
                <Button size="sm" onClick={() => toast.success("Request approved")}>Approve</Button>
              </div>
=======
                    <div className="flex items-center gap-2 text-xs">
                      <PackageCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="font-medium capitalize">
                        {current.raw?.allocation?.asset?.condition ?? current.raw?.asset?.condition ?? "Good"}
                      </span>
                    </div>
                    {current.expectedReturnDate && (
                      <div className="flex items-center gap-2 text-xs">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Est. Return:</span>
                        <span className="font-medium">{new Date(current.expectedReturnDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <ol className="relative space-y-4 pl-2">
                    {timeline.map((t: any, i: number) => (
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
                  {(current.status === "pending" || current.status === "requested") && canManage ? (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (current.type === "Transfer") {
                            processTransferMutation.mutate({ id: current.dbId, action: "REJECT" });
                          } else {
                            toast.error("Only transfer requests can be rejected");
                          }
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (current.type === "Transfer") {
                            processTransferMutation.mutate({ id: current.dbId, action: "APPROVE" });
                          } else if (current.type === "Return") {
                            processReturnMutation.mutate({ id: current.dbId, checkInNotes: "Good condition - returned" });
                          } else {
                            toast.info("This allocation is already active.");
                          }
                        }}
                      >
                        Approve
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Select a request to view timeline and details.
                </div>
              )}
>>>>>>> Stashed changes
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
