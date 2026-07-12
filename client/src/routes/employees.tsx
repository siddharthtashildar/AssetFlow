import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, MoreHorizontal, Mail, MapPin, Filter } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getUsers, getCurrentUser } from "../lib/api";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [{ title: "Employees · AssetFlow" }] }),
  component: Employees,
});

function initials(n: string) { return n.split(" ").map((s) => s[0]).slice(0, 2).join(""); }

function Employees() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const { data: dbUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

  const employees = useMemo(() => {
    return dbUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department?.name ?? "Engineering",
      location: "HQ (San Francisco)",
      status: u.isActive ? "active" : "inactive",
      joined: u.createdAt
        ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "Jul 2026",
    }));
  }, [dbUsers]);

  const filtered = useMemo(() => employees.filter((e) => {
    const okQ = !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.email.toLowerCase().includes(q.toLowerCase());
    const okD = dept === "all" || e.department === dept;
    return okQ && okD;
  }), [employees, q, dept]);

  return (
    <>
      <PageHeader
        title="Employees"
        description="Directory of all employees, their roles, and current asset allocations."
        actions={
          <>
            <Button size="sm" variant="outline">Import CSV</Button>
            {isAdmin && (
              <Button size="sm" asChild>
                <Link to="/register"><Plus />Add employee</Link>
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        <Card>
          <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email…" className="pl-9 h-9" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger className="h-9 w-[200px]"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {[...new Set(employees.map((e) => e.department))].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9"><Filter />Filters</Button>
              <Tabs defaultValue="list">
                <TabsList className="h-9">
                  <TabsTrigger value="list" className="text-xs">List</TabsTrigger>
                  <TabsTrigger value="grid" className="text-xs">Grid</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 20).map((e) => (
                  <TableRow key={e.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-medium">{initials(e.name)}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{e.name}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{e.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{e.role}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">{e.department}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</TableCell>
                    <TableCell><StatusBadge value={e.status} /></TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{e.joined}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Assigned assets</DropdownMenuItem>
                          <DropdownMenuItem>Send message</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
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
