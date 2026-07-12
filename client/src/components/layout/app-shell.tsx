import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import { CommandPalette, useCommandPalette } from "./command-palette";
import { ThemeProvider } from "@/lib/theme";

export function AppShell({ children }: { children: ReactNode }) {
  const { open, setOpen } = useCommandPalette();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <Topbar onCommand={() => setOpen(true)} />
        <main className="flex-1 min-w-0">{children}</main>
      </SidebarInset>
      <CommandPalette open={open} onOpenChange={setOpen} />
      <Toaster position="bottom-right" richColors closeButton />
    </SidebarProvider>
  );
}
