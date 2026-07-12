import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Download, Filter, Search, MoreHorizontal, Eye, Pencil, Trash2, QrCode,
  ChevronLeft, ChevronRight, SlidersHorizontal, Boxes,
} from "lucide-react";
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
        department: "",
        cost: a.acquisitionCost ?? 0,
        purchaseDate: a.acquisitionDate ? new Date(a.acquisitionDate).toLocaleDateString() : "",
        shared: a.isBookable,
        image: a.category?.name?.includes("Mobile") ? "📱" :
               a.category?.name?.includes("Monitor") ? "🖥️" :
               a.category?.name?.includes("Furniture") ? "🪑" : "💻",
      };
    });
  }, [dbAssets]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cols, setCols] = useState<Set<string>>(new Set(ALL_COLS));
  const perPage = 8;

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const q = query.toLowerCase();
      const okQ = !q || a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || (a.assignee ?? "").toLowerCase().includes(q);
      const okS = status === "all" || a.status === status;
      const okC = category === "all" || a.category === category;
      return okQ && okS && okC;
    });
  }, [query, status, category]);

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
                          <DropdownMenuItem><Eye />View details</DropdownMenuItem>
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
    </>
  );
}
