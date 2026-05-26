import { Link, useRouterState } from "@tanstack/react-router";
import {
  BedDouble,
  CalendarCheck,
  Images,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "./sidebar-context";

const TABS = [
  { label: "Home", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "ALL", to: "/admin/bookings", icon: CalendarCheck },
  { label: "Rooms", to: "/admin/rooms", icon: BedDouble },
  { label: "Gallery", to: "/admin/gallery", icon: Images },
] as const;

export function AdminMobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setMobileOpen } = useSidebarState();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/90 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary navigation"
    >
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {TABS.map(({ label, to, icon: Icon, end }) => {
          const active = end
            ? pathname === "/admin" || pathname === "/admin/"
            : pathname === to || pathname.startsWith(`${to}/`);

          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 px-1 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5 shrink-0", active && "stroke-[2.5]")} />
              <span className="truncate max-w-full">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 px-1 text-[10px] font-medium text-muted-foreground"
          aria-label="Open menu"
        >
          <Menu className="size-5 shrink-0" />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
