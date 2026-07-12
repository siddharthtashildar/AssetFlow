import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, MoreHorizontal, Building2, Users, Package } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { departments } from "@/lib/mock-data";

export const Route = createFileRoute("/departments")({
  head: () => ({ meta: [{ title: "Departments · AssetFlow" }] }),
  component: Departments,
});

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("");
}

function Departments() {
  return (
    <>
      <PageHeader
        title="Departments"
        description="Manage organizational structure, department heads and asset distribution."
        actions={<><Button size="sm" variant="outline">Export</Button><Button size="sm"><Plus />New department</Button></>}
      />
      <PageBody>
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
                  <Badge variant="secondary" className="text-[10px]">{d.id}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-muted/40 p-2.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-medium"><Users className="h-3 w-3" />People</div>
                    <div className="mt-1 text-lg font-semibold tabular-nums">{d.employees}</div>
                  </div>
                  <div className="rounded-md bg-muted/40 p-2.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-medium"><Package className="h-3 w-3" />Assets</div>
                    <div className="mt-1 text-lg font-semibold tabular-nums">{d.assets}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t pt-3">
                  <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px] bg-muted">{initials(d.head)}</AvatarFallback></Avatar>
                  <span className="text-xs text-muted-foreground truncate">Head: <span className="text-foreground font-medium">{d.head}</span></span>
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
              <Input placeholder="Search departments…" className="pl-9 h-9 w-64" />
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
                {departments.map((d) => (
                  <TableRow key={d.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Building2 className="h-4 w-4" /></div>
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="font-mono text-[10px]">{d.code}</Badge></TableCell>
                    <TableCell className="text-sm">{d.head}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{d.employees}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{d.assets}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View members</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
