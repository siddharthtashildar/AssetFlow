import { createFileRoute } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { Plus, MoreHorizontal, Search } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { categories } from "@/lib/mock-data";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Asset Categories · AssetFlow" }] }),
  component: Categories,
});

function Categories() {
  return (
    <>
      <PageHeader
        title="Asset Categories"
        description="Group similar assets to standardize lifecycle, depreciation and reporting."
        actions={<Button size="sm"><Plus />New category</Button>}
      />
      <PageBody>
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search categories…" className="pl-9 h-9 w-72" />
          </div>
          <div className="text-xs text-muted-foreground">{categories.length} categories · {categories.reduce((s, c) => s + c.count, 0).toLocaleString()} assets</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => {
            const Icon = (Icons as any)[c.icon] || Icons.Package;
            return (
              <Card key={c.id} className="group cursor-pointer hover:shadow-elevated hover:-translate-y-0.5 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View assets</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold leading-tight">{c.name}</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground font-mono">{c.id}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-semibold tabular-nums">{c.count}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">Assets</div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{c.depreciation}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}
