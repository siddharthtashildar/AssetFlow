import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, Package, Users, Wrench, CalendarDays, ClipboardCheck, BarChart3,
  PlusSquare, Bell, Settings, Building2, Boxes, ArrowLeftRight,
} from "lucide-react";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const go = (to: string) => { onOpenChange(false); navigate({ to }); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search assets, employees, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => go("/")}><LayoutDashboard /> Dashboard</CommandItem>
          <CommandItem onSelect={() => go("/assets")}><Boxes /> Asset Directory</CommandItem>
          <CommandItem onSelect={() => go("/employees")}><Users /> Employees</CommandItem>
          <CommandItem onSelect={() => go("/departments")}><Building2 /> Departments</CommandItem>
          <CommandItem onSelect={() => go("/bookings")}><CalendarDays /> Bookings</CommandItem>
          <CommandItem onSelect={() => go("/maintenance")}><Wrench /> Maintenance</CommandItem>
          <CommandItem onSelect={() => go("/audits")}><ClipboardCheck /> Audits</CommandItem>
          <CommandItem onSelect={() => go("/reports")}><BarChart3 /> Reports & Analytics</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => go("/assets/register")}><PlusSquare /> Register new asset</CommandItem>
          <CommandItem onSelect={() => go("/assets/allocations")}><ArrowLeftRight /> Allocate or transfer</CommandItem>
          <CommandItem onSelect={() => go("/bookings")}><CalendarDays /> Book a resource</CommandItem>
          <CommandItem onSelect={() => go("/maintenance")}><Wrench /> Raise maintenance ticket</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="System">
          <CommandItem onSelect={() => go("/notifications")}><Bell /> Notifications</CommandItem>
          <CommandItem onSelect={() => go("/settings")}><Settings /> Settings</CommandItem>
          <CommandItem onSelect={() => go("/assets")}><Package /> Search all assets</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
