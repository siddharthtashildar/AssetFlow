import { createFileRoute } from "@tanstack/react-router";
import { User, Palette, Shield, Bell, Settings as SettingsIcon, KeyRound, LogOut } from "lucide-react";
import { PageHeader, PageBody } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";
import { getCurrentUser } from "../lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · AssetFlow" }] }),
  component: Settings,
});

function Settings() {
  const { theme, toggle } = useTheme();
  const currentUser = getCurrentUser();
  const initials = currentUser?.name
    ? currentUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "US";
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, workspace preferences and security." />
      <PageBody>
        <Tabs defaultValue="profile" className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <TabsList className="flex flex-col h-fit bg-transparent p-0 items-stretch">
            <TabsTrigger value="profile" className="justify-start gap-2 data-[state=active]:bg-muted"><User className="h-4 w-4" />Profile</TabsTrigger>
            <TabsTrigger value="appearance" className="justify-start gap-2 data-[state=active]:bg-muted"><Palette className="h-4 w-4" />Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="justify-start gap-2 data-[state=active]:bg-muted"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
            <TabsTrigger value="security" className="justify-start gap-2 data-[state=active]:bg-muted"><Shield className="h-4 w-4" />Security</TabsTrigger>
            <TabsTrigger value="preferences" className="justify-start gap-2 data-[state=active]:bg-muted"><SettingsIcon className="h-4 w-4" />Preferences</TabsTrigger>
          </TabsList>

          <div className="min-w-0">
            <TabsContent value="profile" className="mt-0 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Profile</CardTitle><CardDescription>How others see you across AssetFlow.</CardDescription></CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16"><AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">{initials}</AvatarFallback></Avatar>
                    <div>
                      <Button size="sm" variant="outline">Change photo</Button>
                      <p className="text-[11px] text-muted-foreground mt-1.5">JPG, PNG. Max 2MB.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label className="text-xs">Full name</Label><Input defaultValue={currentUser?.name ?? "Guest User"} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input defaultValue={currentUser?.email ?? "guest@example.com"} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Role</Label><Input defaultValue={currentUser?.role ?? "EMPLOYEE"} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Timezone</Label><Input defaultValue="Asia/Kolkata (GMT+5:30)" /></div>
                    <div className="sm:col-span-2 space-y-1.5"><Label className="text-xs">Bio</Label><Textarea defaultValue="Leading enterprise asset operations at AssetFlow." rows={3} /></div>
                  </div>
                  <div className="flex justify-end gap-2"><Button variant="outline" size="sm">Cancel</Button><Button size="sm" onClick={() => toast.success("Profile updated")}>Save changes</Button></div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0">
              <Card>
                <CardHeader><CardTitle className="text-base">Appearance</CardTitle><CardDescription>Customize your workspace look.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <Row title="Theme" desc="Switch between light and dark mode.">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{theme === "dark" ? "Dark" : "Light"}</span>
                      <Switch checked={theme === "dark"} onCheckedChange={toggle} />
                    </div>
                  </Row>
                  <Separator />
                  <Row title="Density" desc="Adjust padding and spacing across tables.">
                    <select className="h-9 rounded-md border bg-background px-2 text-sm"><option>Comfortable</option><option>Compact</option></select>
                  </Row>
                  <Separator />
                  <Row title="Sidebar" desc="Auto-collapse on smaller screens.">
                    <Switch defaultChecked />
                  </Row>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader><CardTitle className="text-base">Notifications</CardTitle><CardDescription>Choose what you want to hear about.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    ["Maintenance updates", "Ticket status changes, new comments"],
                    ["Bookings", "Reminders, conflicts, cancellations"],
                    ["Audits", "Cycle milestones and discrepancies"],
                    ["Warranties", "Expiring warranty coverage"],
                    ["Weekly digest", "A Monday summary of all activity"],
                  ].map(([t, d], i) => (
                    <div key={t}>
                      <Row title={t} desc={d}><Switch defaultChecked={i < 3} /></Row>
                      {i < 4 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Security</CardTitle><CardDescription>Protect your account.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <Row title="Two-factor authentication" desc="Add an extra layer of security on sign-in."><Button size="sm" variant="outline"><KeyRound />Enable 2FA</Button></Row>
                  <Separator />
                  <Row title="Active sessions" desc="You are signed in on 2 devices."><Button size="sm" variant="outline">View sessions</Button></Row>
                  <Separator />
                  <Row title="Sign out everywhere" desc="Log out of all other devices immediately."><Button size="sm" variant="outline" className="text-destructive"><LogOut />Sign out</Button></Row>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0">
              <Card>
                <CardHeader><CardTitle className="text-base">Preferences</CardTitle><CardDescription>Personalize your workflows.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <Row title="Default landing page" desc="Where you go after signing in.">
                    <select className="h-9 rounded-md border bg-background px-2 text-sm"><option>Dashboard</option><option>Asset Directory</option><option>Maintenance</option></select>
                  </Row>
                  <Separator />
                  <Row title="Date format" desc="How dates are displayed.">
                    <select className="h-9 rounded-md border bg-background px-2 text-sm"><option>DD MMM YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
                  </Row>
                  <Separator />
                  <Row title="Show tips" desc="Contextual tips inside the workspace."><Switch defaultChecked /></Row>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </PageBody>
    </>
  );
}

function Row({ title, desc, children }: any) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}
