import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, MoreHorizontal, Building2, Users, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCurrentUser,
  getUsers,
  DepartmentRecord
} from "@/lib/api";

export const Route = createFileRoute("/departments")({
  head: () => ({ meta: [{ title: "Departments · AssetFlow" }] }),
  component: Departments,
});

function initials(name: string) {
  if (!name) return "";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("");
}

function Departments() {
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const [search, setSearch] = useState("");
  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())
  );

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentRecord | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [headId, setHeadId] = useState<string | null>(null);
  const [parentDepartmentId, setParentDepartmentId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setCode("");
    setHeadId(null);
    setParentDepartmentId(null);
    setEditingDept(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (d: DepartmentRecord) => {
    setEditingDept(d);
    setName(d.name);
    setCode(d.code);
    setHeadId(d.head?.id || null);
    setParentDepartmentId(d.parentDepartmentId || null);
    setIsDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department created successfully.");
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create department");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; data: any }) => updateDepartment(args.id, args.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated successfully.");
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update department");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete department");
    },
  });

  const handleSave = () => {
    if (!name || !code) {
      toast.error("Name and Code are required.");
      return;
    }
    const payload = {
      name,
      code,
      headId: (headId === "unassigned" ? null : headId) ?? undefined,
      parentDepartmentId: (parentDepartmentId === "none" ? null : parentDepartmentId) ?? undefined,
    };
    
    if (editingDept) {
      updateMutation.mutate({ id: editingDept.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <PageHeader
        title="Departments"
        description="Manage organizational structure, department heads and asset distribution."
        actions={
          <>
            <Button size="sm" variant="outline">Export</Button>
            {isAdmin && (
              <Button size="sm" onClick={handleOpenNew} disabled={createMutation.isPending}>
                <Plus />New department
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading departments...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {departments.slice(0, 4).map((d) => (
                <Card key={d.id} className="hover:shadow-elevated transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{d.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{d.code}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{d.id.substring(0, 8)}...</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-md bg-muted/40 p-2.5">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-medium"><Users className="h-3 w-3" />People</div>
                        <div className="mt-1 text-lg font-semibold tabular-nums">{d._count?.users || 0}</div>
                      </div>
                      <div className="rounded-md bg-muted/40 p-2.5">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-medium"><Package className="h-3 w-3" />Assets</div>
                        <div className="mt-1 text-lg font-semibold tabular-nums">{d._count?.assets || 0}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 border-t pt-3">
                      <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px] bg-muted">{initials(d.head?.name || "Unassigned")}</AvatarFallback></Avatar>
                      <span className="text-xs text-muted-foreground truncate">Head: <span className="text-foreground font-medium">{d.head?.name || "Unassigned"}</span></span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle className="text-base">All departments</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search departments…" 
                    className="pl-9 h-9 w-64" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Head</TableHead>
                      <TableHead className="text-right">Employees</TableHead>
                      <TableHead className="text-right">Assets</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.map((d) => (
                      <TableRow key={d.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Building2 className="h-4 w-4" /></div>
                            <span className="text-sm font-medium">{d.name}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="font-mono text-[10px]">{d.code}</Badge></TableCell>
                        <TableCell className="text-sm">{d.head?.name || "Unassigned"}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{d._count?.users || 0}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{d._count?.assets || 0}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isAdmin && <DropdownMenuItem onClick={() => handleOpenEdit(d)}>Edit</DropdownMenuItem>}
                              <DropdownMenuItem>View members</DropdownMenuItem>
                              {isAdmin && (
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(d.id)}>Delete</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredDepartments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No departments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </PageBody>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingDept ? "Edit Department" : "New Department"}</DialogTitle>
            <DialogDescription>
              {editingDept ? "Update the department details." : "Create a new department in the organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="e.g. ENG"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="head">Department Head</Label>
              <Select value={headId || "unassigned"} onValueChange={setHeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a head..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent">Parent Department</Label>
              <Select value={parentDepartmentId || "none"} onValueChange={setParentDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent department..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {departments
                    .filter(d => !editingDept || d.id !== editingDept.id)
                    .map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
