import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeftRight, PackageCheck, RotateCw, Clock, CheckCircle2, XCircle,
  User, MapPin, Plus, AlertTriangle, CalendarDays, ClipboardCheck,
} from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllocations,
  getTransfers,
  getAssets,
  getUsers,
  createAllocation,
  requestTransfer,
  requestReturn,
  processTransfer,
  completeReturn,
  getCurrentUser,
} from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/assets/allocations")({
  head: () => ({ meta: [{ title: "Allocation & Transfers · AssetFlow" }] }),
  component: Allocations,
});

const workflows = [
  { key: "allocate", title: "Allocate asset", desc: "Assign an available asset to an employee", icon: PackageCheck, tone: "text-success bg-success/10" },
  { key: "transfer", title: "Transfer asset", desc: "Move asset between employees or departments", icon: ArrowLeftRight, tone: "text-info bg-info/10" },
  { key: "return", title: "Return asset", desc: "Employee returns asset to inventory", icon: RotateCw, tone: "text-warning bg-warning/15" },
];

function Allocations() {
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

    // Transfer requests
    dbTransfers.forEach((t) => {
      list.push({
        id: t.id,
        dbId: t.id,
        type: "Transfer",
        asset: t.allocation?.asset?.name ?? "Unknown Asset",
        tag: t.allocation?.asset?.assetTag ?? "N/A",
        from: t.requestedBy?.name ?? "N/A",
        to: t.targetUser?.name ?? "N/A",
        dept: "HQ - Operations",
        status: t.status.toLowerCase(), // "requested", "approved", "rejected"
        raised: new Date(t.createdAt).toLocaleDateString(),
        raw: t,
      });
    });

    // Allocations showing return requests or active assignments
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
  return (
    <>
      <PageHeader
        title="Allocation & Transfers"
        description="Manage asset assignments, transfers, and returns with approval workflows."
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsAllocateOpen(true)}><Plus />Allocate</Button>
          </div>
        }
      />
      <PageBody>
        {/* Workflow cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {workflows.map((w) => {
            if (w.key === "allocate" && !canManage) return null;
            return (
              <Card key={w.key} className="group cursor-pointer hover:shadow-elevated transition-all hover:-translate-y-0.5">
              <CardHeader>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${w.tone}`}>
                  <w.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base mt-3">{w.title}</CardTitle>
                <CardDescription>{w.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (w.key === "allocate") setIsAllocateOpen(true);
                    if (w.key === "transfer") setIsTransferOpen(true);
                    if (w.key === "return") setIsReturnOpen(true);
                  }}
                >
                  Start workflow
                </Button>
              </CardContent>
            </Card>
          )})}
        </div>

        {/* Conflict warning */}
        {availableAssets.length === 0 && dbAssets.length > 0 && (
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="flex items-start gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">All assets allocated</p>
                <p className="text-xs text-muted-foreground">There are currently no available assets in the warehouse. Register new assets or process returns first.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          {/* Requests list */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Active requests</CardTitle>
                  <CardDescription>Pending, in progress and recently approved</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {combinedRequests.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No active allocations or transfer requests found.
                </div>
              ) : (
                combinedRequests.map((r) => {
                  const isSelected = r.id === (current?.id ?? "");
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={`flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/30 transition-colors cursor-pointer ${
                        isSelected ? "border-primary bg-primary/4" : ""
                      }`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {r.type === "Allocate" ? <PackageCheck className="h-4 w-4" /> : r.type === "Transfer" ? <ArrowLeftRight className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{r.id.slice(-6).toUpperCase()}</span>
                          <Badge variant="secondary" className="h-5 text-[10px]">{r.type}</Badge>
                          <StatusBadge value={r.status} />
                        </div>
                        <p className="text-sm font-medium truncate mt-1">{r.asset}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          <span className="font-mono">{r.tag}</span> · {r.from} → {r.to}
                        </p>
                      </div>
                      <div className="hidden md:block text-right text-xs text-muted-foreground shrink-0">{r.raised}</div>
                      <Button size="sm" variant={isSelected ? "default" : "outline"}>Review</Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Approval timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approval timeline</CardTitle>
              <CardDescription>
                {current ? `${current.id.slice(-6).toUpperCase()} — ${current.asset}` : "No Request Selected"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {current ? (
                <>
                  <div className="rounded-lg border bg-muted/30 p-3 mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Assignee:</span>
                      <span className="font-medium">{current.to}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{current.dept}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <PackageCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="font-medium capitalize">
                        {current.raw?.allocation?.asset?.condition ?? current.raw?.asset?.condition ?? "Good"}
                      </span>
                    </div>
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
            </CardContent>
          </Card>
        </div>
      </PageBody>

      {/* Allocate Asset Dialog */}
      <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Allocate Asset</DialogTitle>
            <DialogDescription>Assign a warehouse asset directly to an employee.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-select">Asset</Label>
              <select
                id="asset-select"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={allocAssetId}
                onChange={(e) => setAllocAssetId(e.target.value)}
              >
                <option value="">Select AVAILABLE asset...</option>
                {availableAssets.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-select">Employee</Label>
              <select
                id="user-select"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={allocUserId}
                onChange={(e) => setAllocUserId(e.target.value)}
              >
                <option value="">Select Employee...</option>
                {dbUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="return-date">Expected Return Date</Label>
              <Input
                id="return-date"
                type="date"
                value={allocReturnDate}
                onChange={(e) => setAllocReturnDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAllocateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => allocateMutation.mutate({ assetId: allocAssetId, userId: allocUserId, expectedReturnDate: allocReturnDate })}
              disabled={!allocAssetId || !allocUserId}
            >
              Allocate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Request Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Transfer Asset</DialogTitle>
            <DialogDescription>Submit a request to transfer an allocated asset to another employee.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="transfer-alloc-select">Active Allocation</Label>
              <select
                id="transfer-alloc-select"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none"
                value={transAllocId}
                onChange={(e) => setTransAllocId(e.target.value)}
              >
                <option value="">Select active allocation...</option>
                {activeAllocations.map((a) => (
                  <option key={a.id} value={a.id}>{a.asset?.name} ({a.asset?.assetTag}) · held by {a.user?.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transfer-user-select">Target Employee</Label>
              <select
                id="transfer-user-select"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none"
                value={transUserId}
                onChange={(e) => setTransUserId(e.target.value)}
              >
                <option value="">Select new holder...</option>
                {dbUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
            <Button
              onClick={() => transferMutation.mutate({ allocationId: transAllocId, targetUserId: transUserId })}
              disabled={!transAllocId || !transUserId}
            >
              Request Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Asset Dialog */}
      <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
            <DialogDescription>Initiate a return flow for an allocated asset.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="return-alloc-select">Asset Allocation</Label>
              <select
                id="return-alloc-select"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none"
                value={returnAllocId}
                onChange={(e) => setReturnAllocId(e.target.value)}
              >
                <option value="">Select active allocation...</option>
                {activeAllocations.filter(a => a.status === "ACTIVE").map((a) => (
                  <option key={a.id} value={a.id}>{a.asset?.name} ({a.asset?.assetTag}) · held by {a.user?.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnOpen(false)}>Cancel</Button>
            <Button
              onClick={() => returnMutation.mutate(returnAllocId)}
              disabled={!returnAllocId}
            >
              Request Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
