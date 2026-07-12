import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ClipboardCheck, AlertTriangle, Check, Users, Calendar, Building2, X, Lock, FileText } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  getAudits,
  createAuditCycle,
  updateAuditItem,
  closeAuditCycle,
  getDepartments,
  getCategories,
  getUsers,
  getCurrentUser,
  AuditCycleRecord,
  AuditItemRecord
} from "../lib/api";

export const Route = createFileRoute("/audits")({
  head: () => ({ meta: [{ title: "Audits · AssetFlow" }] }),
  component: Audits,
});

function initials(n: string) {
  return n.split(" ").map((s) => s[0]).slice(0, 2).join("");
}

function Audits() {
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const isAdminOrManager = currentUser?.role === "ADMIN" || currentUser?.role === "ASSET_MANAGER";

  // State for Create Cycle Dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDepartmentId, setNewDepartmentId] = useState("all");
  const [newCategoryId, setNewCategoryId] = useState("all");
  const [newAuditorId, setNewAuditorId] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  const resetCreateForm = () => {
    setNewTitle("");
    setNewDepartmentId("all");
    setNewCategoryId("all");
    setNewAuditorId("");
    setNewStartDate("");
    setNewEndDate("");
  };

  // State for Checklist Dialog
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<AuditCycleRecord | null>(null);
  
  // State for auditing a specific item
  const [selectedItemForAudit, setSelectedItemForAudit] = useState<AuditItemRecord | null>(null);
  const [auditResultInput, setAuditResultInput] = useState<string>("VERIFIED");
  const [auditRemarksInput, setAuditRemarksInput] = useState<string>("");

  // Queries
  const { data: dbAudits = [], isLoading: isLoadingAudits } = useQuery({
    queryKey: ["audits"],
    queryFn: getAudits,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    enabled: isCreateOpen,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: isCreateOpen,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: isCreateOpen,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAuditCycle,
    onSuccess: () => {
      toast.success("Audit cycle created successfully");
      setIsCreateOpen(false);
      resetCreateForm();
      queryClient.invalidateQueries({ queryKey: ["audits"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create audit cycle");
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, result, remarks }: { itemId: string; result: string; remarks?: string }) =>
      updateAuditItem(itemId, { result, remarks }),
    onSuccess: (updatedItem) => {
      toast.success("Asset verification updated");
      setSelectedItemForAudit(null);
      setAuditRemarksInput("");
      
      // Update selectedCycle local state so UI updates instantly
      if (selectedCycle) {
        const updatedItems = selectedCycle.auditItems.map((item) =>
          item.id === updatedItem.id
            ? {
                ...item,
                result: updatedItem.result,
                remarks: updatedItem.remarks,
                auditor: updatedItem.auditor
              }
            : item
        );
        setSelectedCycle({
          ...selectedCycle,
          auditItems: updatedItems,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["audits"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update verification");
    }
  });

  const closeMutation = useMutation({
    mutationFn: closeAuditCycle,
    onSuccess: (closedCycle) => {
      toast.success("Audit cycle closed and locked. Database asset statuses updated.");
      setIsChecklistOpen(false);
      setSelectedCycle(null);
      queryClient.invalidateQueries({ queryKey: ["audits"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to close audit cycle");
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() || !newStartDate || !newEndDate || !newAuditorId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const start = new Date(newStartDate);
    const end = new Date(newEndDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error("Please provide valid start and end dates");
      return;
    }

    if (end < start) {
      toast.error("End date cannot be earlier than the start date");
      return;
    }

    createMutation.mutate({
      title: newTitle.trim(),
      startDate: newStartDate,
      endDate: newEndDate,
      departmentId: newDepartmentId === "all" ? undefined : newDepartmentId,
      categoryId: newCategoryId === "all" ? undefined : newCategoryId,
      auditorId: newAuditorId,
    });
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAudit) return;
    updateItemMutation.mutate({
      itemId: selectedItemForAudit.id,
      result: auditResultInput,
      remarks: auditRemarksInput,
    });
  };

  const handleCloseCycle = (cycleId: string) => {
    if (confirm("Are you sure you want to close this audit cycle? This will lock the checklist and update flagged assets (e.g. status set to LOST for missing assets).")) {
      closeMutation.mutate(cycleId);
    }
  };

  // Dynamic Statistics
  const activeCyclesCount = useMemo(() => {
    return dbAudits.filter(a => a.status === "OPEN").length;
  }, [dbAudits]);

  const verifiedAssetsCount = useMemo(() => {
    return dbAudits.reduce((acc, a) => acc + a.auditItems.filter(item => item.result === "VERIFIED").length, 0);
  }, [dbAudits]);

  const discrepanciesCount = useMemo(() => {
    return dbAudits.reduce((acc, a) => acc + a.auditItems.filter(item => item.result === "MISSING" || item.result === "DAMAGED").length, 0);
  }, [dbAudits]);

  const uniqueAuditorsCount = useMemo(() => {
    const auditors = new Set(dbAudits.flatMap(a => a.auditItems.map(item => item.auditorId)));
    return auditors.size;
  }, [dbAudits]);

  // Discrepancy report list
  const discrepancies = useMemo(() => {
    const list: any[] = [];
    dbAudits.forEach((cycle) => {
      cycle.auditItems.forEach((item) => {
        if (item.result === "MISSING" || item.result === "DAMAGED") {
          list.push({
            id: item.id.slice(-6).toUpperCase(),
            audit: cycle.title,
            asset: `${item.asset.assetTag} · ${item.asset.name}`,
            note: item.remarks || "No remarks provided",
            severity: item.result === "MISSING" ? "high" : "medium",
          });
        }
      });
    });
    return list;
  }, [dbAudits]);

  return (
    <>
      <PageHeader
        title="Audits"
        description="Plan cycle counts, track verification progress and resolve discrepancies."
        actions={
          <>
            {isAdminOrManager && (
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                <Plus />New audit cycle
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        <div className="grid gap-4 md:grid-cols-4">
          <MiniStat icon={ClipboardCheck} label="Active cycles" value={activeCyclesCount} tone="primary" />
          <MiniStat icon={Check} label="Assets verified" value={verifiedAssetsCount} tone="success" />
          <MiniStat icon={AlertTriangle} label="Discrepancies" value={discrepanciesCount} tone="warning" />
          <MiniStat icon={Users} label="Auditors" value={uniqueAuditorsCount} tone="info" />
        </div>

        {isLoadingAudits ? (
          <div className="text-center py-12 text-muted-foreground">Loading audit cycles...</div>
        ) : dbAudits.length === 0 ? (
          <div className="text-center py-12 rounded-lg border border-dashed bg-muted/20">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-sm font-semibold text-foreground">No audit cycles</h3>
            <p className="mt-1 text-xs text-muted-foreground">Get started by creating a new scheduled audit cycle.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {dbAudits.map((a) => {
              const totalItems = a.auditItems.length;
              const auditedItems = a.auditItems.filter(i => i.result !== "PENDING").length;
              const progressPct = totalItems > 0 ? Math.round((auditedItems / totalItems) * 100) : 0;
              const verifiedItems = a.auditItems.filter(i => i.result === "VERIFIED").length;
              const cycleDiscrepancies = a.auditItems.filter(i => i.result === "MISSING" || i.result === "DAMAGED").length;
              const primaryAuditor = a.auditItems[0]?.auditor?.name || "Unassigned";
              const formattedDue = new Date(a.endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              });

              // Status badge value: map to status badge mapping
              const mappedStatus = a.status === "OPEN" ? "in-progress" : "completed";

              // Compute category scope dynamically
              const uniqueCategories = Array.from(new Set(a.auditItems.map(i => i.asset.category?.name).filter(Boolean)));
              const categoryScope = uniqueCategories.length === 1 ? uniqueCategories[0] : (uniqueCategories.length > 1 ? "Multiple Categories" : "All Categories");

              return (
                <Card key={a.id} className="hover:shadow-elevated transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-muted-foreground">{a.id.slice(-8).toUpperCase()}</span>
                          <StatusBadge value={mappedStatus} />
                        </div>
                        <CardTitle className="text-base mt-1.5 truncate">{a.title}</CardTitle>
                        <CardDescription className="mt-0.5">
                          Scope: {a.department?.name || "All Departments"} · {categoryScope}
                        </CardDescription>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <ClipboardCheck className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Verification progress</span>
                        <span className="font-medium tabular-nums">{auditedItems}/{totalItems} · {progressPct}%</span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-medium">Auditor</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[9px] bg-muted">{initials(primaryAuditor)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs truncate">{primaryAuditor.split(" ")[0]}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-medium">Discrepancies</div>
                        <div className="mt-1 text-sm font-semibold flex items-center gap-1">
                          {cycleDiscrepancies > 0 && <AlertTriangle className="h-3 w-3 text-warning" />}
                          {cycleDiscrepancies}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />Due
                        </div>
                        <div className="mt-1 text-xs">{formattedDue}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedCycle(a);
                          setIsChecklistOpen(true);
                        }}
                      >
                        {a.status === "OPEN" ? "Continue audit" : "View checklist"}
                      </Button>
                      {a.status === "OPEN" && isAdminOrManager && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 border"
                          onClick={() => handleCloseCycle(a.id)}
                        >
                          <Lock className="mr-1 h-3 w-3" />Close cycle
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Discrepancy report</CardTitle>
            <CardDescription>Items flagged during current audit cycles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {discrepancies.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No discrepancies reported. All assets verified in excellent or good condition.
              </div>
            ) : (
              discrepancies.map((d) => (
                <div key={d.id} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md shrink-0 ${
                    d.severity === "high" ? "bg-destructive/10 text-destructive" :
                    d.severity === "medium" ? "bg-warning/15 text-warning" : "bg-success/10 text-success"
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground">{d.id}</span>
                      <Badge variant="outline" className="text-[10px] max-w-[150px] truncate">{d.audit}</Badge>
                    </div>
                    <p className="text-sm font-medium mt-0.5 truncate">{d.asset}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.note}</p>
                  </div>
                  <StatusBadge value={d.severity} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PageBody>

      {/* NEW AUDIT CYCLE DIALOG */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            resetCreateForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>New Audit Cycle</DialogTitle>
            <DialogDescription>
              Define the scope of the inventory audit and assign an auditor to perform the count.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs">Audit Title</Label>
              <Input
                id="title"
                placeholder="e.g. Q3 2026 Laptop Audit"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs">Scope / Department</Label>
                <Select value={newDepartmentId} onValueChange={setNewDepartmentId}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs">Scope / Category</Label>
                <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auditor" className="text-xs">Assigned Auditor</Label>
              <Select value={newAuditorId} onValueChange={setNewAuditorId}>
                <SelectTrigger id="auditor">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role.replace(/_/g, " ").toLowerCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-xs">End Date (Due Date)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Cycle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CHECKLIST DIALOG */}
      <Dialog open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
        <DialogContent className="sm:max-w-[760px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  {selectedCycle?.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedCycle?.auditItems.length} assets scheduled for verification. Scope: {selectedCycle?.department?.name || "All Departments"} · {
                    selectedCycle?.auditItems ? (() => {
                      const uniqueCats = Array.from(new Set(selectedCycle.auditItems.map(i => i.asset.category?.name).filter(Boolean)));
                      return uniqueCats.length === 1 ? uniqueCats[0] : (uniqueCats.length > 1 ? "Multiple Categories" : "All Categories");
                    })() : "All Categories"
                  }.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs mr-6">
                Status: {selectedCycle?.status}
              </Badge>
            </div>
          </DialogHeader>

          {/* Checklist content scroll container */}
          <div className="flex-1 overflow-y-auto pr-1 my-4 space-y-4">
            {selectedCycle?.auditItems && selectedCycle.auditItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No assets scoped to this audit cycle.</div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Tag</TableHead>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCycle?.auditItems.map((item) => {
                      const isAssignedToMe = item.auditorId === currentUser?.id;
                      const canVerify = selectedCycle.status === "OPEN" && (isAssignedToMe || isAdminOrManager);
                      
                      let resultColor = "secondary";
                      if (item.result === "VERIFIED") resultColor = "success";
                      if (item.result === "MISSING") resultColor = "destructive";
                      if (item.result === "DAMAGED") resultColor = "warning";

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-semibold">{item.asset.assetTag}</TableCell>
                          <TableCell className="font-medium text-xs max-w-[150px] truncate">{item.asset.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{item.asset.location || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={resultColor as any} className="text-[10px] py-0 px-1.5 font-semibold">
                              {item.result}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{item.remarks || "—"}</TableCell>
                          <TableCell className="text-right">
                            {canVerify ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setSelectedItemForAudit(item);
                                  setAuditResultInput(item.result === "PENDING" ? "VERIFIED" : item.result);
                                  setAuditRemarksInput(item.remarks || "");
                                }}
                              >
                                Verify
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Locked</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 border-t pt-3 flex sm:justify-between items-center gap-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              Auditor: <span className="font-medium text-foreground">{selectedCycle?.auditItems[0]?.auditor?.name || "Unassigned"}</span>
            </div>
            <Button type="button" size="sm" onClick={() => setIsChecklistOpen(false)}>
              Close View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* INDIVIDUAL ITEM AUDIT/VERIFICATION DIALOG */}
      <Dialog open={!!selectedItemForAudit} onOpenChange={(open) => !open && setSelectedItemForAudit(null)}>
        <DialogContent className="sm:max-w-[400px] z-50">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Verify Asset {selectedItemForAudit?.asset.assetTag}
            </DialogTitle>
            <DialogDescription>
              Mark the status of the physical asset and log any condition remarks.
            </DialogDescription>
          </DialogHeader>
          {selectedItemForAudit && (
            <form onSubmit={handleAuditSubmit} className="space-y-4 pt-1">
              <div className="bg-muted/30 p-3 rounded-lg border text-xs space-y-1">
                <div><span className="text-muted-foreground">Asset Name:</span> <span className="font-medium">{selectedItemForAudit.asset.name}</span></div>
                <div><span className="text-muted-foreground">Serial Number:</span> <span className="font-medium font-mono">{selectedItemForAudit.asset.serialNumber || "N/A"}</span></div>
                <div><span className="text-muted-foreground">Recorded Location:</span> <span className="font-medium">{selectedItemForAudit.asset.location || "Unknown"}</span></div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="auditResult" className="text-xs">Audit Result</Label>
                <Select value={auditResultInput} onValueChange={setAuditResultInput}>
                  <SelectTrigger id="auditResult">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERIFIED">Verified (Condition Good/OK)</SelectItem>
                    <SelectItem value="MISSING">Missing (Not Found / Lost)</SelectItem>
                    <SelectItem value="DAMAGED">Damaged (Requires Maintenance)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="auditRemarks" className="text-xs">Audit Remarks / Notes</Label>
                <Textarea
                  id="auditRemarks"
                  placeholder="Describe details, location discrepancies, or damage details..."
                  value={auditRemarksInput}
                  onChange={(e) => setAuditRemarksInput(e.target.value)}
                  rows={3}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedItemForAudit(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={updateItemMutation.isPending}>
                  {updateItemMutation.isPending ? "Saving..." : "Save Verification"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MiniStat({ icon: Icon, label, value, tone }: any) {
  const tones: any = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    info: "bg-info/10 text-info",
  };
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}><Icon className="h-4 w-4" /></div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold tabular-nums">{value}</div>
      </div>
    </Card>
  );
}
