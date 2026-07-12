import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, Upload, Info, Package, MapPin, DollarSign,
  FileText, Camera, Shield, Sparkles,
} from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/mock-data";

export const Route = createFileRoute("/assets/register")({
  head: () => ({ meta: [{ title: "Register Asset · AssetFlow" }] }),
  component: RegisterAsset,
});

const steps = [
  { id: 1, title: "General", icon: Package, hint: "Basic identification" },
  { id: 2, title: "Location & Condition", icon: MapPin, hint: "Where & how it is" },
  { id: 3, title: "Financial", icon: DollarSign, hint: "Cost & warranty" },
  { id: 4, title: "Media & Review", icon: Camera, hint: "Photos & confirm" },
];

function RegisterAsset() {
  const [step, setStep] = useState(1);
  const [shared, setShared] = useState(false);
  const nav = useNavigate();

  const submit = () => {
    toast.success("Asset registered successfully", { description: "AF-2024065 has been added to inventory." });
    nav({ to: "/assets" });
  };

  return (
    <>
      <PageHeader
        title="Register a new asset"
        description="Add a physical asset to your organization's inventory in a few steps."
        actions={<Button variant="outline" size="sm" onClick={() => nav({ to: "/assets" })}>Cancel</Button>}
      />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Stepper */}
          <Card className="h-fit p-2 lg:sticky lg:top-20">
            <nav className="space-y-1">
              {steps.map((s) => {
                const active = s.id === step;
                const done = s.id < step;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md p-2.5 text-left transition-colors",
                      active ? "bg-primary/8" : "hover:bg-muted",
                    )}
                  >
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                      done ? "bg-success text-success-foreground" :
                      active ? "bg-primary text-primary-foreground" :
                      "bg-muted text-muted-foreground",
                    )}>
                      {done ? <Check className="h-3.5 w-3.5" /> : s.id}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn("text-sm font-medium", active && "text-primary")}>{s.title}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{s.hint}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Content */}
          <div className="space-y-4">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4 text-primary" />General information</CardTitle>
                  <CardDescription>Identify the asset with a name, category and serial number.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <Field label="Asset name" required>
                    <Input placeholder="e.g. MacBook Pro 16&quot; M3 Max" />
                  </Field>
                  <Field label="Asset tag" hint="Auto-generated, editable">
                    <Input defaultValue="AF-2024065" />
                  </Field>
                  <Field label="Category" required>
                    <Select><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Manufacturer">
                    <Input placeholder="e.g. Apple" />
                  </Field>
                  <Field label="Model" required>
                    <Input placeholder="e.g. A2991" />
                  </Field>
                  <Field label="Serial number" required>
                    <Input placeholder="SN-XXXXXXXX" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Description">
                      <Textarea placeholder="Notes visible to admins and technicians…" rows={3} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <Label className="text-sm">Shared resource</Label>
                        <p className="text-xs text-muted-foreground">Multiple people can book this asset (e.g. meeting rooms, vehicles).</p>
                      </div>
                    </div>
                    <Switch checked={shared} onCheckedChange={setShared} />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4 text-primary" />Location & condition</CardTitle>
                  <CardDescription>Where the asset lives and its current state.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <Field label="Location" required>
                    <Select><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                      <SelectContent>
                        {["HQ - Floor 3", "HQ - Floor 5", "SF Warehouse", "London Office", "Berlin Hub", "Bangalore R&D"].map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Department">
                    <Select><SelectTrigger><SelectValue placeholder="Assign to department" /></SelectTrigger>
                      <SelectContent>
                        {["Engineering", "Product Design", "Finance & Ops", "Sales & Growth", "IT Infrastructure"].map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Current condition" required>
                    <Select><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Initial status">
                    <Select defaultValue="available"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="allocated">Allocated</SelectItem>
                        <SelectItem value="maintenance">In maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Notes on condition">
                      <Textarea placeholder="Any scratches, dents or defects worth noting…" rows={3} />
                    </Field>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4 text-primary" />Financial & warranty</CardTitle>
                  <CardDescription>Track cost, depreciation and warranty coverage.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <Field label="Purchase cost" required hint="USD">
                    <Input type="number" placeholder="0.00" />
                  </Field>
                  <Field label="Vendor / Supplier">
                    <Input placeholder="e.g. Apple Business Direct" />
                  </Field>
                  <Field label="Purchase date" required>
                    <Input type="date" />
                  </Field>
                  <Field label="Warranty expiry">
                    <Input type="date" />
                  </Field>
                  <Field label="Depreciation method">
                    <Select defaultValue="straight"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="straight">Straight line</SelectItem>
                        <SelectItem value="declining">Declining balance</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Useful life (years)">
                    <Input type="number" defaultValue={3} />
                  </Field>
                  <div className="sm:col-span-2 flex items-start gap-3 rounded-lg border border-info/30 bg-info/5 p-3">
                    <Shield className="h-4 w-4 text-info mt-0.5 shrink-0" />
                    <p className="text-xs text-info">Warranty & purchase records help auditors validate compliance during quarterly cycles.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Camera className="h-4 w-4 text-primary" />Media & documents</CardTitle>
                  <CardDescription>Attach photos and any supporting documents.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <UploadBox icon={Camera} title="Asset photos" hint="Drop up to 6 images, or click to upload" />
                    <UploadBox icon={FileText} title="Documents" hint="Invoice, warranty, spec sheet (PDF)" />
                  </div>
                  <Separator />
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2"><Info className="h-4 w-4 text-primary" />Ready to register</div>
                    <p className="text-xs text-muted-foreground">Once submitted, this asset will get a unique QR label and be added to the directory. You can allocate it immediately.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nav */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
                <ArrowLeft />Previous
              </Button>
              {step < 4 ? (
                <Button onClick={() => setStep((s) => s + 1)}>Continue<ArrowRight /></Button>
              ) : (
                <Button onClick={submit}><Check />Register asset</Button>
              )}
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}{required && <span className="text-destructive">*</span>}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function UploadBox({ icon: Icon, title, hint }: { icon: any; title: string; hint: string }) {
  return (
    <button className="group flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors hover:border-primary hover:bg-primary/5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 mb-2">
        <Icon className="h-4 w-4 group-hover:text-primary" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
        <Upload className="h-3 w-3" />Click to upload
      </div>
    </button>
  );
}
