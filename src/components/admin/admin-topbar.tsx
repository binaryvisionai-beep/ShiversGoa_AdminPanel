import { useRouterState, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { AUTH_BYPASS } from "@/lib/auth";
import { motion } from "framer-motion";
// import { Link } from "@tanstack/react-router";

import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useSidebarState } from "./sidebar-context";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ADMIN_PAGE_LABELS: Record<string, string> = {
  admin: "Dashboard",
  bookings: "ALL",
  reservations: "Table",
  "room-bookings": "Room Bookings",
  rooms: "Rooms",
  restaurant: "Restaurant",
  events: "Events",
  gallery: "Gallery",
  messages: "Messages",
  "marketing-routes": "Marketing Page Routes",
  analytics: "Analytics",
  users: "Users",
  notifications: "Notification",
  settings: "Settings",
  homepage: "Homepage",
  about: "About",
  tiffinbox: "Tiffin Box",
  reviews: "Reviews",
};

function getMobilePageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "admin";
  if (pathname === "/admin" || pathname === "/admin/") return ADMIN_PAGE_LABELS.admin;
  return ADMIN_PAGE_LABELS[last] ?? last.charAt(0).toUpperCase() + last.slice(1);
}

export function AdminTopbar() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const { setMobileOpen } = useSidebarState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);
  const mobileTitle = getMobilePageTitle(pathname);

  const initials = session?.name
    ? session.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AM";
  const displayName = session?.name ?? "Amelia M.";

  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 px-3 md:px-8 flex items-center gap-2 md:gap-3 border-b border-border glass pt-[env(safe-area-inset-top)]">
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden size-10 shrink-0 rounded-xl hover:bg-accent flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="md:hidden flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground leading-none">
          Amber Suite
        </p>
        <h1 className="text-base font-semibold truncate leading-tight mt-0.5">{mobileTitle}</h1>
      </div>

      {/* Breadcrumbs */}
      <div className="hidden md:flex items-center text-sm text-muted-foreground min-w-0">
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          const href = "/" + segments.slice(0, i + 1).join("/");
          return (
            <div key={href} className="flex items-center">
              {i > 0 && <ChevronRight className="size-3.5 mx-1.5 text-muted-foreground/50" />}
              <Link
                to={href}
                className={
                  isLast
                    ? "font-medium text-foreground"
                    : "hover:text-foreground transition-colors"
                }
              >
                {ADMIN_PAGE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden lg:flex items-center gap-2.5 w-72 h-10 px-3 rounded-xl bg-muted/60 border border-transparent focus-within:bg-card focus-within:border-border focus-within:ring-2 focus-within:ring-primary/30 transition-all">
        <Search className="size-4 shrink-0 text-muted-foreground pointer-events-none" aria-hidden />
        <input
          type="search"
          placeholder="Search anything..."
          className="flex-1 min-w-0 h-full bg-transparent border-0 p-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
        />
      </div>

      <ThemeToggle className="hidden sm:flex" />

      <IconBtn badge className="hidden md:flex">
        <MessageSquare className="size-[18px]" />
      </IconBtn>

      {/* <IconBtn badge className="hidden md:flex">
        <Bell className="size-[18px]" />
      </IconBtn> */}
<Link to="/admin/notifications">
  <IconBtn badge>
    <Bell className="size-[18px]" />
  </IconBtn>
</Link>


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 pl-1 pr-1 sm:pr-2 h-10 rounded-xl hover:bg-accent transition-colors shrink-0">
            <div className="size-8 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-semibold text-coffee">
              {initials}
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-[11px] text-muted-foreground">Manager</span>
            </div>
            <ChevronDown className="size-4 text-muted-foreground hidden md:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Preferences</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              void (async () => {
                if (!AUTH_BYPASS) await logout();
                navigate({ to: "/", replace: true });
              })();
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function IconBtn({
  children,
  badge,
  className = "",
}: {
  children: React.ReactNode;
  badge?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      className={`relative size-10 rounded-xl hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      {children}
      {badge && (
        <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background" />
      )}
    </motion.button>
  );
}
