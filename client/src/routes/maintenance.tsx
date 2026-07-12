import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Filter, MessageSquare, Wrench, Clock, AlertTriangle, CheckCircle, UserCheck } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  getAssets,
  getCurrentUser,
  MaintenanceRequestRecord,
} from "../lib/api";

export const Route = createFileRoute("/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance · AssetFlow" }] }),
  component: Maintenance,
});

const baseColumns = [
  { key: "pending", title: "Pending", tone: "bg-muted-foreground/60" },
  { key: "approved", title: "Approved", tone: "bg-blue-500" },
  { key: "assigned", title: "Technician Assigned", tone: "bg-indigo-600" },
  { key: "in_progress", title: "In Progress", tone: "bg-amber-500" },
  { key: "resolved", title: "Resolved", tone: "bg-emerald-500" },
];

function initials(n: string) {
  return (n || "")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Maintenance() {
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const canManage = currentUser?.role === "ASSET_MANAGER" || currentUser?.role === "ADMIN";

  // State
  const [showRejected, setShowRejected] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Form states
  const [newAssetId, setNewAssetId] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const [techName, setTechName] = useState("");
  const [resolutionDetails, setResolutionDetails] = useState("");

  // Fetch Requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["maintenanceRequests"],
    queryFn: () => getMaintenanceRequests(),
  });

  // Fetch Assets (for the create dropdown)
  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => getAssets(),
  });

  const allowedAssets = assets.filter((asset: any) => {
    if (currentUser?.role === "EMPLOYEE") {
      const activeAlloc = asset.allocations?.[0];
      return activeAlloc?.user?.id === currentUser.id;
    }
    return true;
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      action,
      payload,
    }: {
      id: string;
      action: "APPROVE" | "REJECT" | "ASSIGN_TECHNICIAN" | "START_WORK" | "RESOLVE";
      payload?: { technician?: string; resolutionDetails?: string };
    }) => updateMaintenanceRequest(id, action, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Request status updated successfully.");
      setIsTechOpen(false);
      setIsResolveOpen(false);
      setTechName("");
      setResolutionDetails("");
    },
    onError: (error: any) => {
      toast.error("Failed to update status", { description: error.message });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      assetId: string;
      description: string;
      priority: string;
      photoUrl?: string;
    }) => createMaintenanceRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceRequests"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Maintenance request raised successfully.");
      setIsCreateOpen(false);
      setNewAssetId("");
      setNewDescription("");
      setNewPriority("MEDIUM");
      setNewPhotoUrl("");
    },
    onError: (error: any) => {
      toast.error("Failed to raise request", { description: error.message });
    },
  });

  // Handlers
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetId) {
      toast.error("Please select an asset.");
      return;
    }
    if (!newDescription.trim()) {
      toast.error("Please enter a description of the issue.");
      return;
    }

    createMutation.mutate({
      assetId: newAssetId,
      description: newDescription,
      priority: newPriority,
      photoUrl: newPhotoUrl || undefined,
    });
  };

  const handleAction = (
    id: string,
    action: "APPROVE" | "REJECT" | "ASSIGN_TECHNICIAN" | "START_WORK" | "RESOLVE"
  ) => {
    if (action === "ASSIGN_TECHNICIAN") {
      setSelectedRequestId(id);
      setIsTechOpen(true);
    } else if (action === "RESOLVE") {
      setSelectedRequestId(id);
      setIsResolveOpen(true);
    } else {
      updateMutation.mutate({ id, action });
    }
  };

  const handleAssignTechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) return;
    if (!techName.trim()) {
      toast.error("Technician name is required.");
      return;
    }
    updateMutation.mutate({
      id: selectedRequestId,
      action: "ASSIGN_TECHNICIAN",
      payload: { technician: techName },
    });
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) return;
    updateMutation.mutate({
      id: selectedRequestId,
      action: "RESOLVE",
      payload: { resolutionDetails: resolutionDetails.trim() || undefined },
    });
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.technician || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" || r.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesPriority;
  });

  // Calculate Stats
  const openRequests = requests.filter((r) => r.status !== "RESOLVED" && r.status !== "REJECTED");
  const criticalOpen = openRequests.filter((r) => r.priority === "CRITICAL" || r.priority === "HIGH");
  const pendingRequests = openRequests.filter((r) => r.status === "PENDING");
  const resolvedRequests = requests.filter((r) => r.status === "RESOLVED");

  const columns = (showRejected && canManage)
    ? [...baseColumns, { key: "rejected", title: "Rejected", tone: "bg-rose-500" }]
    : baseColumns;

  return (
    <>
      <PageHeader
        title="Maintenance Board"
        description="Track and progress equipment maintenance requests."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />New request
            </Button>
          </div>
        }
      />

      <PageBody>
        {/* Filters and Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatMini label="Open Requests" value={openRequests.length.toString()} icon={Wrench} tone="warning" />
          <StatMini label="Pending Approval" value={pendingRequests.length.toString()} icon={Clock} tone="default" />
          <StatMini label="Critical Issues" value={criticalOpen.length.toString()} icon={AlertTriangle} tone="danger" />
          <StatMini label="Resolved History" value={resolvedRequests.length.toString()} icon={CheckCircle} tone="success" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-card p-4 rounded-lg border">
          <div className="flex flex-1 max-w-md items-center gap-2">
            <Input
              placeholder="Search by asset, issue, technician…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="priority-filter" className="text-xs text-muted-foreground whitespace-nowrap">Priority:</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger id="priority-filter" className="h-9 w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canManage && (
              <div className="flex items-center gap-2">
                <Switch
                  id="show-rejected"
                  checked={showRejected}
                  onCheckedChange={setShowRejected}
                />
                <Label htmlFor="show-rejected" className="text-xs font-medium cursor-pointer">
                  Show Rejected Column
                </Label>
              </div>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <p className="text-muted-foreground">Loading maintenance board...</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 w-full scrollbar-thin">
            {columns.map((col) => {
              const colRequests = filteredRequests.filter(
                (r) => r.status.toLowerCase() === col.key.toLowerCase()
              );

              return (
                <div
                  key={col.key}
                  className="flex flex-col rounded-lg border bg-muted/20 w-[290px] shrink-0 h-[650px] overflow-hidden shadow-sm"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between p-3 border-b bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", col.tone)} />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {col.title}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                      {colRequests.length}
                    </Badge>
                  </div>

                  {/* Cards container */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                    {colRequests.length === 0 ? (
                      <div className="text-center text-xs text-muted-foreground py-12 border-2 border-dashed rounded-lg bg-card/20">
                        No requests
                      </div>
                    ) : (
                      colRequests.map((req) => (
                        <Card
                          key={req.id}
                          className="p-3 shadow-sm hover:shadow-md transition-shadow bg-card border relative group"
                        >
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {req.asset.assetTag}
                            </span>
                            <StatusBadge value={req.priority.toLowerCase()} />
                          </div>

                          <h4 className="text-sm font-semibold leading-tight line-clamp-1 mb-1">
                            {req.asset.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-3 mb-3 leading-relaxed whitespace-pre-wrap">
                            {req.description}
                          </p>

                          {req.photoUrl && (
                            <div className="mb-3 rounded overflow-hidden max-h-24 bg-muted">
                              <img
                                src={req.photoUrl}
                                alt="Issue Attachment"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Hide image if URL is invalid
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}

                          {req.technician && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 p-1.5 rounded mb-3">
                              <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate">Tech: <strong>{req.technician}</strong></span>
                            </div>
                          )}

                          {req.resolutionDetails && (
                            <div className="text-[10px] italic text-muted-foreground bg-emerald-500/5 border border-emerald-500/10 p-1.5 rounded mb-3">
                              Resolved: "{req.resolutionDetails}"
                            </div>
                          )}

                          {/* Footer details */}
                          <div className="flex items-center justify-between border-t pt-2 mt-2">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-5 w-5 border">
                                <AvatarFallback className="text-[8px] font-bold">
                                  {initials(req.raisedBy.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
                                {req.raisedBy.name.split(" ")[0]}
                              </span>
                            </div>
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Action Buttons for Asset Manager */}
                          {canManage && (
                            <div className="mt-3 pt-2 border-t flex flex-wrap gap-1.5">
                              {req.status === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs text-emerald-600 hover:text-emerald-700 h-7 px-2"
                                    onClick={() => handleAction(req.id, "APPROVE")}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs text-rose-600 hover:text-rose-700 h-7 px-2"
                                    onClick={() => handleAction(req.id, "REJECT")}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}

                              {req.status === "APPROVED" && (
                                <Button
                                  size="sm"
                                  className="w-full text-xs h-7"
                                  onClick={() => handleAction(req.id, "ASSIGN_TECHNICIAN")}
                                >
                                  Assign Technician
                                </Button>
                              )}

                              {req.status === "ASSIGNED" && (
                                <Button
                                  size="sm"
                                  className="w-full text-xs h-7"
                                  onClick={() => handleAction(req.id, "START_WORK")}
                                >
                                  Start Work
                                </Button>
                              )}

                              {req.status === "IN_PROGRESS" && (
                                <Button
                                  size="sm"
                                  className="w-full text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                  onClick={() => handleAction(req.id, "RESOLVE")}
                                >
                                  Resolve Issue
                                </Button>
                              )}
                            </div>
                          )}
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageBody>

      {/* Raised Request Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Raise Maintenance Request</DialogTitle>
            <DialogDescription>
              Report an issue with an enterprise asset to start the repair process.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRequest} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="asset-select">Select Asset</Label>
              <Select value={newAssetId} onValueChange={setNewAssetId}>
                <SelectTrigger id="asset-select">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {allowedAssets.map((asset: any) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.assetTag})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Issue Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue or malfunction details..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Attachment Photo URL (Optional)</Label>
              <Input
                id="photo"
                placeholder="https://example.com/photo.png"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Technician Dialog */}
      <Dialog open={isTechOpen} onOpenChange={setIsTechOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription>
              Enter the name of the technician assigned to resolve this issue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignTechSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tech-name">Technician Name</Label>
              <Input
                id="tech-name"
                placeholder="E.g. Jane Doe, AV Support Lead"
                value={techName}
                onChange={(e) => setTechName(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTechOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Resolve Request</DialogTitle>
            <DialogDescription>
              Provide resolution notes to mark this maintenance request as complete.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResolveSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="res-notes">Resolution Details (Optional)</Label>
              <Textarea
                id="res-notes"
                placeholder="E.g. Replaced battery, display backlight repair complete, screen checked."
                value={resolutionDetails}
                onChange={(e) => setResolutionDetails(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsResolveOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {updateMutation.isPending ? "Completing..." : "Complete Repair"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatMini({ label, value, icon: Icon, tone }: any) {
  const tones: any = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-destructive/10 text-destructive",
    default: "bg-primary/10 text-primary",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tones[tone] || tones.default)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
