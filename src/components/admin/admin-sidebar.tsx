import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  BookMarked,
  BedDouble,
  Hotel,
  UtensilsCrossed,
  PartyPopper,
  Images,
  Star,
  MessageSquare,
  Route,
  BarChart3,
  Users,
  Settings,
  Bell,
  ChevronsLeft,
  Search,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useSidebarState } from "./sidebar-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Item = { label: string; to: string; icon: React.ComponentType<{ className?: string }>; badge?: string };

// const NAV: { section: string; items: Item[] }[] = [
//   {
//     section: "Overview",
//     items: [
//       { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
//       { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
//     ],
//   },
//   {
//     section: "Hospitality",
//     items: [
//       { label: "Bookings", to: "/admin/bookings", icon: CalendarCheck, badge: "12" },
//       { label: "Reservations", to: "/admin/reservations", icon: BookMarked },
//       { label: "Rooms", to: "/admin/rooms", icon: BedDouble },
//       { label: "Restaurant", to: "/admin/restaurant", icon: UtensilsCrossed },
//       { label: "Events", to: "/admin/events", icon: PartyPopper },
//     ],
//   },
//   {
//     section: "Content",
//     items: [
//       { label: "Gallery", to: "/admin/gallery", icon: Images },
//       { label: "Messages", to: "/admin/messages", icon: MessageSquare, badge: "3" },
//       {
//         label: "Marketing Page Routes",
//         to: "/admin/marketing-routes",
//         icon: Route,
//       },
//     ],
//   },
//   {
//     section: "System",
//     items: [
//       { label: "Users", to: "/admin/users", icon: Users },
//       { label: "Settings", to: "/admin/settings", icon: Settings },
//     ],
//   },
// ];


const NAV: { section: string; items: Item[] }[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
    ],
  },

  {
    section: "Homepage CMS",
    items: [
      { label: "Homepage", to: "/admin/homepage", icon: LayoutDashboard },
      { label: "About", to: "/admin/about", icon: Users },

    ],
  },

  {
    section: "Bookings",
    items: [
      { label: "ALL", to: "/admin/bookings", icon: CalendarCheck, badge: "12" },
      { label: "Room Bookings", to: "/admin/room-bookings", icon: Hotel },
      { label: "Restaurant", to: "/admin/restaurant", icon: UtensilsCrossed },
      { label: "Events", to: "/admin/events", icon: PartyPopper },
    ],
  },

  {
    section: "Edit",
    items: [
      { label: "Rooms", to: "/admin/rooms", icon: BedDouble },
      { label: "Table", to: "/admin/reservations", icon: BookMarked },
      { label: "Events", to: "/admin/events/edit", icon: PartyPopper },
      { label: "Tiffin Box", to: "/admin/tiffinbox", icon: UtensilsCrossed },
    ],
  },

  {
    section: "Content",
    items: [
      { label: "Gallery", to: "/admin/gallery", icon: Images },
      { label: "Reviews", to: "/admin/reviews", icon: Star },
      { label: "Messages", to: "/admin/messages", icon: MessageSquare, badge: "3" },
      {
        label: "Marketing Page Routes",
        to: "/admin/marketing-routes",
        icon: Route,
      },
      { to: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
    ],
  },

  {
    section: "System",
    items: [
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Notification", to: "/admin/notifications", icon: Bell },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];


function SidebarInner({
  pathname,
  collapsed,
  forceExpanded = false,
  onNavigate,
  session,
}: {
  pathname: string;
  collapsed: boolean;
  forceExpanded?: boolean;
  onNavigate?: () => void;
  session: { name?: string; email?: string } | null;
}) {
  const isCollapsed = !forceExpanded && collapsed;

  const initials = session?.name
    ? session.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <>
      {/* Brand */}
      <div className={cn("h-16 flex items-center gap-3 px-4 border-b border-sidebar-border shrink-0", isCollapsed && "justify-center px-0")}>
        <div className="size-9 rounded-xl bg-gradient-amber flex items-center justify-center shadow-glow shrink-0">
          <Sparkles className="size-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col leading-tight"
            >
              <span className="font-display text-lg tracking-wide">Shivers</span>
              <span className="text-[11px] font-medium text-sidebar-foreground/70 mt-0.5">
                Admin Panel
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search */}
      <div className={cn("px-3 pt-4", isCollapsed && "px-2")}>
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full h-10 rounded-xl bg-sidebar-accent/40 hover:bg-sidebar-accent flex items-center justify-center transition-colors">
                <Search className="size-4 text-sidebar-foreground/70" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Search</TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 h-10 px-3 rounded-xl bg-sidebar-accent/40 border border-sidebar-border focus-within:ring-2 focus-within:ring-primary/40 transition-shadow">
            <Search
              className="size-4 shrink-0 text-sidebar-foreground/50 pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search..."
              className="flex-1 min-w-0 h-full bg-transparent border-0 p-0 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-0"
            />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {NAV.map((group) => (
          <div key={group.section}>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/40"
                >
                  {group.section}
                </motion.div>
              )}
            </AnimatePresence>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  pathname === item.to ||
                  (item.to !== "/admin" && pathname.startsWith(item.to));
                const Row = (
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 h-10 text-sm transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="active-pill"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary shadow-glow"
                      />
                    )}
                    <item.icon
                      className={cn(
                        "size-[18px] shrink-0 transition-colors",
                        active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );

                return (
                  <li key={`${group.section}-${item.label}`}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{Row}</TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      Row
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className={cn("border-t border-sidebar-border p-3 shrink-0")}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-accent/60 transition-colors cursor-pointer",
            isCollapsed && "justify-center"
          )}
        >
          <div className="size-9 rounded-full bg-gradient-gold flex items-center justify-center text-sm font-semibold text-coffee shrink-0">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 leading-tight">
              <div className="text-sm font-medium truncate">
                {session?.name ?? "Guest"}
              </div>
              <div className="text-[11px] text-sidebar-foreground/50 truncate">{session?.email ?? ""}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const { session } = useAuth();
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebarState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const width = collapsed ? 88 : 280;

  const content = (
    <TooltipProvider delayDuration={100}>
      <motion.aside
        initial={false}
        animate={{ width }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="hidden md:flex relative h-full z-40 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-hidden shrink-0"
      >
        <SidebarInner pathname={pathname} collapsed={collapsed} session={session} />
        <button
          onClick={toggle}
          className="absolute top-20 -right-3 size-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-colors shadow-soft"
          aria-label="Toggle sidebar"
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronsLeft className="size-3.5" />
          </motion.span>
        </button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-coffee/40 backdrop-blur-sm"
              style={{ background: "color-mix(in oklab, var(--coffee) 50%, transparent)" }}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col"
            >
              <SidebarInner
                pathname={pathname}
                collapsed={collapsed}
                forceExpanded
                session={session}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );

  return content;
}
