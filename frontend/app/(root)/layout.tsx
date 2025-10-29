"use client";
import { AppSidebar } from "@/components/layouts/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useProtectedRoute } from "@/hooks/auth/useProtectedRoute";
import { Loader2 } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useProtectedRoute();

  // Show loading while store is hydrating
  if (!hydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading while redirecting if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-neutral-950">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </SidebarProvider>
  );
}
