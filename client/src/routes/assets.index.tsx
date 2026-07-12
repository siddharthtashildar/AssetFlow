import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Download, Filter, Search, MoreHorizontal, Eye, Pencil, Trash2, QrCode,
  ChevronLeft, ChevronRight, SlidersHorizontal, Boxes, Wrench,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getAssets, getAllocations, getCurrentUser } from "../lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/assets/")({
  head: () => ({ meta: [{ title: "Asset Directory · AssetFlow" }] }),
  component: AssetDirectory,
});

const ALL_COLS = ["Asset", "Category", "Status", "Condition", "Assignee", "Location", "Cost", "QR"] as const;

function AssetDirectory() {
  const currentUser = getCurrentUser();
  const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "ASSET_MANAGER";

  const { data: dbAssets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => getAssets(),
  });

  const { data: dbAllocations = [] } = useQuery({
    queryKey: ["allocations"],
    queryFn: () => getAllocations(),
  });

  const assets = useMemo(() => {
    return dbAssets.map((a: any) => {
      const activeAlloc = a.allocations?.[0];
      return {
        id: a.id,
        tag: a.assetTag,
        name: a.name,
        category: a.category?.name ?? "Uncategorized",
        serial: a.serialNumber ?? "",
        status: a.status.toLowerCase(),
        condition: a.condition.toLowerCase(),
        location: a.location ?? "Unknown",
        assignee: activeAlloc?.user?.name ?? null,
        assigneeId: activeAlloc?.user?.id ?? null,
        department: "",
        cost: a.acquisitionCost ?? 0,
        purchaseDate: a.acquisitionDate ? new Date(a.acquisitionDate).toLocaleDateString() : "",
        shared: a.isBookable,
        image: a.category?.name?.includes("Mobile") ? "📱" :
               a.category?.name?.includes("Monitor") ? "🖥️" :
               a.category?.name?.includes("Furniture") ? "🪑" : "💻",
        maintenanceRequests: a.maintenanceRequests ?? [],
      };
    });
  }, [dbAssets]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cols, setCols] = useState<Set<string>>(new Set(ALL_COLS));
  const [detailsAsset, setDetailsAsset] = useState<any>(null);
  const perPage = 8;

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (currentUser?.role === "EMPLOYEE" && a.assigneeId !== currentUser.id) {
        return false;
      }
      const q = query.toLowerCase();
      const okQ = !q || a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || (a.assignee ?? "").toLowerCase().includes(q);
      const okS = status === "all" || a.status === status;
      const okC = category === "all" || a.category === category;
      return okQ && okS && okC;
    });
  }, [query, status, category, assets, currentUser]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const toggleAll = () => {
    if (paged.every((a) => selected.has(a.id))) {
      const next = new Set(selected); paged.forEach((a) => next.delete(a.id)); setSelected(next);
    } else {
      const next = new Set(selected); paged.forEach((a) => next.add(a.id)); setSelected(next);
    }
  };
  const toggle = (id: string) => {
    const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); setSelected(next);
  };
  const show = (c: string) => cols.has(c);

  return (
    <>
      <PageHeader
        title="Asset Directory"
        description={`${assets.length.toLocaleString()} assets under management across 8 departments`}
        actions={
          <>
            <Button variant="outline" size="sm"><Download />Export</Button>
            {canManage && (
              <Button size="sm" asChild><Link to="/assets/register"><Plus />Register asset</Link></Button>
            )}
          </>
        }
      />
      <PageBody>
        <Card className="overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, tag, assignee…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 h-9" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {[...new Set(assets.map((a) => a.category))].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9"><Filter />More filters</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9"><SlidersHorizontal />Columns</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ALL_COLS.map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c}
                      checked={cols.has(c)}
                      onCheckedChange={(v) => {
                        const next = new Set(cols);
                        v ? next.add(c) : next.delete(c);
                        setCols(next);
                      }}
                    >{c}</DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <div className="flex items-center justify-between border-b bg-primary/5 px-3 py-2 text-sm">
              <span className="font-medium">{selected.size} selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success(`Exported ${selected.size} assets`)}>Export</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Bulk transfer initiated")}>Transfer</Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => { toast.success(`Retired ${selected.size} assets`); setSelected(new Set()); }}>Retire</Button>
              </div>
            </div>
          )}

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Boxes className="h-5 w-5 text-muted-foreground" /></div>
              <p className="mt-3 text-sm font-medium">No assets found</p>
              <p className="text-xs text-muted-foreground">Try adjusting filters or search terms.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox checked={paged.length > 0 && paged.every((a) => selected.has(a.id))} onCheckedChange={toggleAll} />
                  </TableHead>
                  {show("Asset") && <TableHead>Asset</TableHead>}
                  {show("Category") && <TableHead>Category</TableHead>}
                  {show("Status") && <TableHead>Status</TableHead>}
                  {show("Condition") && <TableHead>Condition</TableHead>}
                  {show("Assignee") && <TableHead>Assignee</TableHead>}
                  {show("Location") && <TableHead>Location</TableHead>}
                  {show("Cost") && <TableHead className="text-right">Cost</TableHead>}
                  {show("QR") && <TableHead className="w-[60px]">QR</TableHead>}
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/40">
                    <TableCell><Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} /></TableCell>
                    {show("Asset") && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-lg shrink-0">{a.image}</div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{a.name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{a.tag}</div>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {show("Category") && <TableCell><Badge variant="secondary" className="font-normal">{a.category}</Badge></TableCell>}
                    {show("Status") && <TableCell><StatusBadge value={a.status} /></TableCell>}
                    {show("Condition") && <TableCell><StatusBadge value={a.condition} /></TableCell>}
                    {show("Assignee") && <TableCell className="text-sm">{a.assignee ?? <span className="text-muted-foreground">—</span>}</TableCell>}
                    {show("Location") && <TableCell className="text-sm text-muted-foreground">{a.location}</TableCell>}
                    {show("Cost") && <TableCell className="text-right text-sm tabular-nums">${a.cost.toLocaleString()}</TableCell>}
                    {show("QR") && (
                      <TableCell>
                        <div className="flex h-8 w-8 items-center justify-center rounded border bg-background">
                          <QrCode className="h-4 w-4" />
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailsAsset(a)}>
                            <Eye className="h-4 w-4 mr-2" />View details
                          </DropdownMenuItem>
                          {canManage && <DropdownMenuItem><Pencil />Edit</DropdownMenuItem>}
                          <DropdownMenuItem><QrCode />Print label</DropdownMenuItem>
                          {canManage && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive"><Trash2 />Retire asset</DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-sm">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * perPage + 1}</span>–
              <span className="font-medium text-foreground">{Math.min(page * perPage, filtered.length)}</span> of{" "}
              <span className="font-medium text-foreground">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs px-2 tabular-nums">Page {page} / {totalPages}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </PageBody>

      {/* Asset Details Dialog */}
      <Dialog open={!!detailsAsset} onOpenChange={() => setDetailsAsset(null)}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          {detailsAsset && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{detailsAsset.image || "📦"}</div>
                  <div>
                    <DialogTitle className="text-xl font-bold">{detailsAsset.name}</DialogTitle>
                    <DialogDescription className="font-mono text-xs">{detailsAsset.tag}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                <div>
                  <span className="text-xs text-muted-foreground block">Category</span>
                  <span className="text-sm font-semibold">{detailsAsset.category}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Serial Number</span>
                  <span className="text-sm font-semibold font-mono">{detailsAsset.serial || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Status</span>
                  <div className="mt-0.5"><StatusBadge value={detailsAsset.status} /></div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Condition</span>
                  <div className="mt-0.5"><StatusBadge value={detailsAsset.condition} /></div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Current Assignee</span>
                  <span className="text-sm font-semibold">{detailsAsset.assignee || "Not Allocated"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Location</span>
                  <span className="text-sm font-semibold">{detailsAsset.location}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Cost</span>
                  <span className="text-sm font-semibold">${detailsAsset.cost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Purchase Date</span>
                  <span className="text-sm font-semibold">{detailsAsset.purchaseDate || "—"}</span>
                </div>
              </div>

              {/* Maintenance History */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-primary" /> Maintenance History
                </h3>

                {detailsAsset.maintenanceRequests && detailsAsset.maintenanceRequests.length > 0 ? (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {detailsAsset.maintenanceRequests.map((req: any) => (
                      <div key={req.id} className="p-3 rounded-lg border bg-muted/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                              {req.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <StatusBadge value={req.priority.toLowerCase()} />
                            <StatusBadge value={req.status.toLowerCase()} />
                          </div>
                        </div>

                        <p className="text-foreground leading-relaxed font-medium text-[11px]">
                          {req.description}
                        </p>

                        {(req.technician || req.resolutionDetails) && (
                          <div className="pt-2 border-t border-dashed mt-1 space-y-1.5 text-[10px]">
                            {req.technician && (
                              <div>
                                <span className="text-muted-foreground">Technician:</span> <strong>{req.technician}</strong>
                              </div>
                            )}
                            {req.resolutionDetails && (
                              <div className="bg-emerald-500/5 border border-emerald-500/10 p-1.5 rounded text-emerald-800 dark:text-emerald-300">
                                <span className="font-semibold">Resolution:</span> "{req.resolutionDetails}"
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1 justify-between">
                          <span>Raised by: <strong>{req.raisedBy?.name || "Unknown"}</strong></span>
                          <span>Last updated: {new Date(req.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-xs text-muted-foreground bg-muted/10">
                    No maintenance history recorded for this asset.
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
