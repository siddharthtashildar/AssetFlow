import { createFileRoute } from "@tanstack/react-router";
import { Plus, ChevronLeft, ChevronRight, Clock, Users, AlertTriangle, CalendarDays } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { bookings } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "Bookings · AssetFlow" }] }),
  component: Bookings,
});

const resources = ["Conference Room — Aurora", "Conference Room — Nebula", "Conference Room — Cosmos", "Rally Bar — Studio B", "Tesla Model 3 (Fleet)", "Oscilloscope MDO4"];
const hours = ["8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
const slots = [
  { r: 0, s: 1, span: 2, label: "Priya · Weekly sync", color: "bg-primary/20 border-primary/40 text-primary" },
  { r: 1, s: 3, span: 1, label: "Marcus · Design review", color: "bg-info/20 border-info/40 text-info" },
  { r: 2, s: 6, span: 1, label: "Diego · Client demo", color: "bg-warning/20 border-warning/40 text-warning" },
  { r: 3, s: 2, span: 3, label: "Zoe · Recording session", color: "bg-success/20 border-success/40 text-success" },
  { r: 4, s: 4, span: 4, label: "Fleet · Marcus", color: "bg-primary/20 border-primary/40 text-primary" },
  { r: 5, s: 5, span: 2, label: "Nina · Lab session", color: "bg-info/20 border-info/40 text-info" },
];

function Bookings() {
  return (
    <>
      <PageHeader
        title="Resource Bookings"
        description="Schedule rooms, vehicles and shared equipment. Detect conflicts before they happen."
        actions={<><Button variant="outline" size="sm">Today</Button><Button size="sm"><Plus />New booking</Button></>}
      />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b space-y-0">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                <div>
                  <div className="text-sm font-semibold">Thursday, Feb 15, 2024</div>
                  <div className="text-xs text-muted-foreground">6 resources · 8h – 18h</div>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <Tabs defaultValue="day">
                <TabsList className="h-8">
                  <TabsTrigger value="day" className="text-xs">Day</TabsTrigger>
                  <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Hour header */}
                <div className="grid grid-cols-[180px_repeat(11,minmax(0,1fr))] border-b bg-muted/30 text-[10px] font-medium text-muted-foreground uppercase">
                  <div className="p-2 border-r">Resource</div>
                  {hours.map((h) => <div key={h} className="p-2 border-r text-center tabular-nums">{h}:00</div>)}
                </div>
                {/* Rows */}
                {resources.map((res, ri) => (
                  <div key={res} className="grid grid-cols-[180px_repeat(11,minmax(0,1fr))] border-b relative min-h-[52px] hover:bg-muted/20">
                    <div className="p-2 border-r flex items-center text-xs font-medium truncate">{res}</div>
                    {hours.map((h) => <div key={h} className="border-r" />)}
                    {slots.filter((s) => s.r === ri).map((s, i) => (
                      <div
                        key={i}
                        className={`absolute top-1.5 bottom-1.5 rounded-md border px-2 py-1 text-[11px] font-medium shadow-sm cursor-pointer hover:shadow-elevated transition ${s.color}`}
                        style={{
                          left: `calc(180px + (${s.s} * ((100% - 180px) / 11)))`,
                          width: `calc(${s.span} * ((100% - 180px) / 11) - 4px)`,
                        }}
                      >{s.label}</div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="flex items-start gap-3 py-4">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Conflict detected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Cosmos room booked twice at 15:30 — Amelia Chen & Kenji Tanaka</p>
                  <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">Resolve</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />Upcoming bookings</CardTitle>
                <CardDescription>Next 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-muted-foreground">{b.id}</span>
                      <StatusBadge value={b.status} />
                    </div>
                    <p className="text-sm font-medium leading-tight">{b.resource}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.date} · {b.start}–{b.end}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{b.attendees}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Avatar className="h-5 w-5"><AvatarFallback className="text-[9px] bg-muted">{b.requester.split(" ").map((p) => p[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
                      <span className="text-xs text-muted-foreground">{b.requester}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
