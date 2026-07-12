import { createFileRoute } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { Plus, MoreHorizontal, Search, Package, Laptop, Server, Monitor, Smartphone, Car, Armchair } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, deleteCategory, getCurrentUser } from "../lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Asset Categories · AssetFlow" }] }),
  component: Categories,
});

const getCategoryIcon = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("laptop") || normalized.includes("computer")) return Laptop;
  if (normalized.includes("server") || normalized.includes("network")) return Server;
  if (normalized.includes("monitor") || normalized.includes("screen") || normalized.includes("display")) return Monitor;
  if (normalized.includes("phone") || normalized.includes("mobile") || normalized.includes("tablet") || normalized.includes("ipad")) return Smartphone;
  if (normalized.includes("furniture") || normalized.includes("chair") || normalized.includes("desk") || normalized.includes("table")) return Armchair;
  if (normalized.includes("vehicle") || normalized.includes("car")) return Car;
  return Package;
};

function Categories() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Category form state
  const [newName, setNewName] = useState("");
  const [newDepreciation, setNewDepreciation] = useState("Straight line (3 years)");

  const currentUser = getCurrentUser();
  const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "ASSET_MANAGER";

  const { data: dbCategories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const categoryMutation = useMutation({
    mutationFn: () => createCategory({ name: newName, depreciation: newDepreciation }),
    onSuccess: () => {
      toast.success("Category created", {
        description: `Successfully added '${newName}' to categories.`,
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDialogOpen(false);
      setNewName("");
      setNewDepreciation("Straight line (3 years)");
    },
    onError: (err: any) => {
      toast.error("Failed to create category", { description: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error("Failed to delete category", { description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Validation error", { description: "Category name is required" });
      return;
    }
    categoryMutation.mutate();
  };

  const filteredCategories = dbCategories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAssets = dbCategories.reduce((acc, c) => acc + (c._count?.assets ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Asset Categories"
        description="Group similar assets to standardize lifecycle, depreciation and reporting."
        actions={
          canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1.5 h-4 w-4" /> New category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                      Create a standard grouping for hardware or assets in the inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category-name">Category Name</Label>
                      <Input
                        id="category-name"
                        placeholder="e.g. Tablets, Audio Gear"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="depreciation">Depreciation Policy / Description</Label>
                      <Input
                        id="depreciation"
                        placeholder="e.g. Straight line (3 years), None"
                        value={newDepreciation}
                        onChange={(e) => setNewDepreciation(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={categoryMutation.isPending}>
                      {categoryMutation.isPending ? "Creating..." : "Save Category"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />
      <PageBody>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories…"
              className="pl-9 h-9 w-72"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {filteredCategories.length} categories · {totalAssets.toLocaleString()} assets
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading categories...</span>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Package className="h-10 w-10 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-sm font-semibold">No categories found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try searching for a different term or register a new category.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((c) => {
              const Icon = getCategoryIcon(c.name);
              const assetCount = c._count?.assets ?? 0;
              return (
                <Card key={c.id} className="group cursor-pointer hover:shadow-elevated hover:-translate-y-0.5 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View assets</DropdownMenuItem>
                          {canManage && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete the category "${c.name}"?`)) {
                                    deleteMutation.mutate(c.id);
                                  }
                                }}
                              >
                                Delete Category
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold leading-tight">{c.name}</h3>
                    <p className="mt-1 text-[11px] text-muted-foreground font-mono truncate">{c.id}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-semibold tabular-nums">{assetCount}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-medium">Assets</div>
                      </div>
                      {c.description && (
                        <Badge variant="secondary" className="text-[10px] truncate max-w-[140px]">
                          {c.description}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </PageBody>
    </>
  );
}
