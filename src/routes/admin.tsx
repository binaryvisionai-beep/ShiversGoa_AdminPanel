import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/admin/sidebar-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminPwa } from "@/components/admin/admin-pwa";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AUTH_BYPASS, getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    meta: [
      { name: "theme-color", content: "#C9792B" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Amber Admin" },
    ],
  }),
  beforeLoad: async () => {
    if (AUTH_BYPASS) return;
    const session = await getSession();
    if (!session) throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminPwa />
      <Shell />
    </SidebarProvider>
  );
}

function Shell() {
  return (
    <div className="admin-shell h-[100dvh] flex bg-background text-foreground overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 min-w-0 min-h-0 w-full flex flex-col">
        <AdminTopbar />
        <main className="admin-main flex-1 min-h-0 min-w-0 w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6 lg:pb-10">
          <div className="min-w-0 max-w-full">
            <Outlet />
          </div>
        </main>
        <AdminMobileNav />
      </div>
    </div>
  );
}
