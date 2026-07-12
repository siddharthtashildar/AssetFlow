import { createFileRoute } from "@tanstack/react-router";
import { Plus, ClipboardCheck, AlertTriangle, Check, Users, Calendar } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { audits } from "@/lib/mock-data";

export const Route = createFileRoute("/audits")({
  head: () => ({ meta: [{ title: "Audits · AssetFlow" }] }),
  component: Audits,
});

function initials(n: string) { return n.split(" ").map((s) => s[0]).slice(0, 2).join(""); }

const discrepancies = [
  { id: "DIS-01", audit: "AUD-2024-Q1", asset: "AF-2024007 · Cisco Catalyst 9300", note: "Not found at recorded location", severity: "high" },
  { id: "DIS-02", audit: "AUD-2024-FUR", asset: "AF-2024089 · Herman Miller Aeron", note: "Serial mismatch with registry", severity: "medium" },
  { id: "DIS-03", audit: "AUD-2024-FUR", asset: "AF-2024102 · Standing Desk Pro", note: "Condition worse than recorded", severity: "low" },
  { id: "DIS-04", audit: "AUD-2024-Q1", asset: "AF-2024014 · Dell UltraSharp", note: "Verified — resolved on-site", severity: "resolved" },
];

function Audits() {
  return (
    <>
      <PageHeader
        title="Audits"
        description="Plan cycle counts, track verification progress and resolve discrepancies."
        actions={<><Button variant="outline" size="sm">Export report</Button><Button size="sm"><Plus />New audit cycle</Button></>}
      />
      <PageBody>
        <div className="grid gap-4 md:grid-cols-4">
          <MiniStat icon={ClipboardCheck} label="Active cycles" value="3" tone="primary" />
          <MiniStat icon={Check} label="Assets verified" value="944" tone="success" />
          <MiniStat icon={AlertTriangle} label="Discrepancies" value="17" tone="warning" />
          <MiniStat icon={Users} label="Auditors" value="8" tone="info" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {audits.map((a) => (
            <Card key={a.id} className="hover:shadow-elevated transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground">{a.id}</span>
                      <StatusBadge value={a.status} />
                    </div>
                    <CardTitle className="text-base mt-1.5 truncate">{a.name}</CardTitle>
                    <CardDescription className="mt-0.5">{a.scope}</CardDescription>
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
                    <span className="font-medium tabular-nums">{a.verified}/{a.total} · {a.progress}%</span>
                  </div>
                  <Progress value={a.progress} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">Auditor</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar className="h-5 w-5"><AvatarFallback className="text-[9px] bg-muted">{initials(a.assigned)}</AvatarFallback></Avatar>
                      <span className="text-xs truncate">{a.assigned.split(" ")[0]}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">Discrepancies</div>
                    <div className="mt-1 text-sm font-semibold flex items-center gap-1">
                      {a.discrepancies > 0 && <AlertTriangle className="h-3 w-3 text-warning" />}
                      {a.discrepancies}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />Due</div>
                    <div className="mt-1 text-xs">{a.due}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">View checklist</Button>
                  <Button size="sm" className="flex-1">Continue audit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Discrepancy report</CardTitle>
            <CardDescription>Items flagged during current audit cycles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {discrepancies.map((d) => (
              <div key={d.id} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md shrink-0 ${
                  d.severity === "high" ? "bg-destructive/10 text-destructive" :
                  d.severity === "medium" ? "bg-warning/15 text-warning" :
                  d.severity === "low" ? "bg-info/10 text-info" : "bg-success/10 text-success"
                }`}>
                  {d.severity === "resolved" ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">{d.id}</span>
                    <Badge variant="outline" className="text-[10px]">{d.audit}</Badge>
                  </div>
                  <p className="text-sm font-medium mt-0.5 truncate">{d.asset}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.note}</p>
                </div>
                <StatusBadge value={d.severity} />
              </div>
            ))}
          </CardContent>
        </Card>
      </PageBody>
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
