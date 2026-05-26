import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  format,
  formatDistanceToNow,
  isToday,
  isWithinInterval,
  parseISO,
  subDays,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Filter,
  Loader2,
  Search,
  SlidersHorizontal,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { ReservationDetailPanel } from "@/components/admin/reservations/reservation-detail-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { DateRangePreset } from "@/lib/bookings/types";
import { mapDbRowToReservation } from "@/lib/reservations/map-reservation";
import { RESTAURANT_TABLES, ZONE_LABELS } from "@/lib/reservations/tables";
import { formatTimeSlot } from "@/lib/reservations/time-slots";
import type { Reservation, RestaurantReservation } from "@/lib/reservations/types";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "oldest" | "name" | "visit";
type StatusFilter = "all" | "pending" | "confirmed" | "cancelled" | "completed";

const STATUS_OPTIONS: StatusFilter[] = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

const selectTriggerClass =
  "h-9 rounded-lg text-sm shrink-0 w-full sm:w-auto sm:min-w-[7.5rem] lg:min-w-0";

function normalizeStatus(s: string) {
  return s.toLowerCase();
}

function inDateRange(visitDate: string, preset: DateRangePreset): boolean {
  if (preset === "all") return true;
  const d = parseISO(visitDate);
  const now = new Date();
  if (preset === "today") return isToday(d);
  if (preset === "7d") {
    return isWithinInterval(d, { start: subDays(now, 7), end: now });
  }
  if (preset === "30d") {
    return isWithinInterval(d, { start: subDays(now, 30), end: now });
  }
  return true;
}

function getGuestName(row: RestaurantReservation) {
  return row.guest_name || row.customer_name || "—";
}

function getGuestPhone(row: RestaurantReservation) {
  return row.guest_phone || row.customer_phone || "";
}

function formatTableDisplay(row: RestaurantReservation) {
  const meta = RESTAURANT_TABLES.find(
    (t) => t.id.toLowerCase() === (row.table_id ?? "").toLowerCase(),
  );
  const name = meta?.name ?? row.table_label ?? row.table_id ?? "—";
  const zoneKey = meta?.zone ?? row.table_zone;
  const zone = zoneKey
    ? ZONE_LABELS[zoneKey] ?? zoneKey.charAt(0).toUpperCase() + zoneKey.slice(1)
    : null;
  const seats = meta?.seats ?? row.table_seats;
  const sub =
    zone && seats
      ? `${zone} · ${seats} seats`
      : zone
        ? zone
        : seats
          ? `${seats} seats`
          : null;
  return { name, sub };
}

function StatusBadge({ status }: { status: string }) {
  const s = normalizeStatus(status);
  const map: Record<string, string> = {
    confirmed: "bg-primary/10 text-primary border-primary/20",
    pending: "bg-gold/15 text-bronze border-gold/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    completed: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("rounded-full font-normal capitalize", map[s] ?? "")}>
      <span className="size-1.5 rounded-full bg-current mr-1.5" />
      {s}
    </Badge>
  );
}

function StatCard({
  label,
  description,
  value,
  accent,
}: {
  label: string;
  description: string;
  value: number;
  accent?: "amber";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border p-4 text-left shadow-soft w-full bg-card",
        accent === "amber" && "bg-gradient-to-br from-primary/6 to-card",
      )}
    >
      <p className="text-sm font-medium leading-tight">{label}</p>
      <p className="font-display text-2xl sm:text-3xl mt-2">{value}</p>
      <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{description}</p>
    </div>
  );
}

function ReservationRow({
  row,
  mapped,
  selected,
  onSelect,
  onDelete,
}: {
  row: RestaurantReservation;
  mapped: Reservation;
  selected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const name = getGuestName(row);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const table = formatTableDisplay(row);

  return (
    <motion.tr
      layout
      variants={rowVariants}
      onClick={onSelect}
      className={cn(
        "border-b border-border/80 cursor-pointer transition-colors hover:bg-muted/40",
        selected && "bg-primary/5",
        normalizeStatus(row.status) === "cancelled" && "opacity-60",
      )}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-semibold text-coffee shrink-0">
            {initials || "?"}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{name}</p>
            {getGuestPhone(row) && (
              <p className="text-xs text-muted-foreground truncate">{getGuestPhone(row)}</p>
            )}
            {row.reference_code && (
              <p className="text-xs text-muted-foreground">{row.reference_code}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <p className="font-medium">{format(parseISO(row.reservation_date), "EEE, d MMM")}</p>
        <p className="text-xs text-muted-foreground">{formatTimeSlot(mapped.time)}</p>
      </td>
      <td className="px-4 py-3.5 text-center">{row.guests ?? row.guest_count ?? "—"}</td>
      <td className="px-4 py-3.5 min-w-0 max-w-[180px]">
        <p className="font-medium truncate">{table.name}</p>
        {table.sub && <p className="text-xs text-muted-foreground truncate">{table.sub}</p>}
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={row.status} />
      </td>
      <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap hidden lg:table-cell">
        {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
      </td>
      <td className="px-4 py-3.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          aria-label="Delete reservation"
        >
          <Trash2 className="size-4" />
        </Button>
      </td>
    </motion.tr>
  );
}

function ReservationCard({
  row,
  mapped,
  selected,
  onSelect,
}: {
  row: RestaurantReservation;
  mapped: Reservation;
  selected: boolean;
  onSelect: () => void;
}) {
  const name = getGuestName(row);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const table = formatTableDisplay(row);

  return (
    <motion.button
      type="button"
      layout
      variants={rowVariants}
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 flex gap-3 border-b border-border transition-colors",
        selected ? "bg-primary/5" : "hover:bg-muted/40",
      )}
    >
      <div className="size-10 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-semibold text-coffee shrink-0">
        {initials || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium truncate">{name}</p>
          <StatusBadge status={row.status} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {format(parseISO(row.reservation_date), "d MMM")} · {formatTimeSlot(mapped.time)} ·{" "}
          {row.guests ?? row.guest_count ?? "—"} guests
        </p>
        <p className="text-sm text-muted-foreground mt-1 truncate">
          {table.name}
          {table.sub ? ` · ${table.sub}` : ""}
        </p>
      </div>
    </motion.button>
  );
}

export default function RestaurantAdminPage() {
  const [rows, setRows] = useState<RestaurantReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RestaurantReservation | null>(null);
  const [updating, setUpdating] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangePreset>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("restaurant_reservations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRows((data as RestaurantReservation[]) ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Could not load reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mappedById = useMemo(() => {
    const map = new Map<string, Reservation>();
    for (const row of rows) {
      map.set(row.id, mapDbRowToReservation(row));
    }
    return map;
  }, [rows]);

  const stats = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return {
      total: rows.length,
      today: rows.filter((r) => r.reservation_date === todayStr).length,
      confirmed: rows.filter((r) => normalizeStatus(r.status) === "confirmed").length,
      pending: rows.filter((r) => normalizeStatus(r.status) === "pending").length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (!inDateRange(r.reservation_date, dateRange)) return false;
      if (statusFilter !== "all" && normalizeStatus(r.status) !== statusFilter) return false;
      if (q) {
        const name = getGuestName(r).toLowerCase();
        const phone = getGuestPhone(r).toLowerCase();
        if (!name.includes(q) && !phone.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "name") return getGuestName(a).localeCompare(getGuestName(b));
      if (sort === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sort === "visit") {
        const da = `${a.reservation_date}T${a.reservation_time ?? "00:00"}`;
        const db = `${b.reservation_date}T${b.reservation_time ?? "00:00"}`;
        return da.localeCompare(db);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [rows, search, dateRange, statusFilter, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    dateRange !== "all" ||
    statusFilter !== "all" ||
    sort !== "newest";

  const clearFilters = () => {
    setSearch("");
    setDateRange("all");
    setStatusFilter("all");
    setSort("newest");
  };

  const selectedReservation = selected ? mappedById.get(selected.id) : null;

  const openDetail = (row: RestaurantReservation) => {
    setSelected(row);
    setSheetOpen(true);
  };

  const refreshRow = (updated: RestaurantReservation) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelected(updated);
  };

  const handleStatusChange = async (status: string) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from("restaurant_reservations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", selected.id)
        .select()
        .single();

      if (error) throw error;
      refreshRow(data as RestaurantReservation);
      toast.success("Status updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reservation permanently?")) return;
    try {
      const { error } = await supabase.from("restaurant_reservations").delete().eq("id", id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) {
        setSelected(null);
        setSheetOpen(false);
      }
      toast.success("Reservation deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 max-w-full overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between min-w-0"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Management</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl mt-1">Restaurant</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl">
            Table reservations from the Shivers Restaurant page — filter, sort, and update status.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl h-11 shrink-0"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Refresh
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          label="Total Reservations"
          description="All table reservations"
          value={stats.total}
        />
        <StatCard
          label="Today's Reservations"
          description="Scheduled for today"
          value={stats.today}
          accent="amber"
        />
        <StatCard
          label="Pending"
          description="Awaiting confirmation"
          value={stats.pending}
        />
        <StatCard
          label="Confirmed"
          description="Approved bookings"
          value={stats.confirmed}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-border space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium shrink-0">
              <SlidersHorizontal className="size-4 text-primary" />
              Filters & sort
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg lg:hidden h-8"
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter className="size-4 mr-1" />
              {showFilters ? "Hide" : "Show"}
            </Button>
          </div>

          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                key="filters"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2">
                  <Label htmlFor="restaurant-search" className="sr-only">
                    Search guest
                  </Label>
                  <div className="relative w-full sm:w-40 lg:w-44 shrink-0">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      id="restaurant-search"
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Name or phone..."
                      className="w-full h-9 pl-8 pr-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <Label htmlFor="restaurant-date" className="sr-only">
                    Visit date
                  </Label>
                  <Select
                    value={dateRange}
                    onValueChange={(v) => setDateRange(v as DateRangePreset)}
                  >
                    <SelectTrigger
                      id="restaurant-date"
                      className={cn(selectTriggerClass, "lg:w-[7.75rem]")}
                    >
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>

                  <Label htmlFor="restaurant-status" className="sr-only">
                    Status
                  </Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                  >
                    <SelectTrigger
                      id="restaurant-status"
                      className={cn(selectTriggerClass, "lg:w-[8.5rem]")}
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All statuses</SelectItem>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Label htmlFor="restaurant-sort" className="sr-only">
                    Sort by
                  </Label>
                  <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                    <SelectTrigger
                      id="restaurant-sort"
                      className={cn(selectTriggerClass, "lg:w-[10.5rem]")}
                    >
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="visit">Visit soonest</SelectItem>
                      <SelectItem value="name">Name A–Z</SelectItem>
                    </SelectContent>
                  </Select>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg shrink-0 px-3"
                      onClick={clearFilters}
                    >
                      <X className="size-3.5 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 sm:px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span> reservation
            {filtered.length !== 1 ? "s" : ""}
          </span>
          {loading && (
            <span className="flex items-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="size-3.5 animate-spin" /> Loading…
            </span>
          )}
        </div>

        {loading && rows.length === 0 ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center"
          >
            <UtensilsCrossed className="size-12 mx-auto text-muted-foreground/40" />
            <h3 className="font-display text-xl mt-4">No reservations match</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Try widening the date range or clearing filters.
            </p>
            {hasActiveFilters && (
              <Button className="mt-6 rounded-xl" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-border">
              <motion.div variants={listVariants} initial="hidden" animate="show">
                <AnimatePresence mode="popLayout">
                  {filtered.map((row) => {
                    const mapped = mappedById.get(row.id)!;
                    return (
                      <ReservationCard
                        key={row.id}
                        row={row}
                        mapped={mapped}
                        selected={selected?.id === row.id}
                        onSelect={() => openDetail(row)}
                      />
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border">
                    <th className="px-4 py-3 font-medium">Guest</th>
                    <th className="px-4 py-3 font-medium">Visit</th>
                    <th className="px-4 py-3 font-medium text-center">Guests</th>
                    <th className="px-4 py-3 font-medium">Table</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Booked</th>
                    <th className="px-4 py-3 font-medium w-12" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.map((row) => {
                      const mapped = mappedById.get(row.id)!;
                      return (
                        <ReservationRow
                          key={row.id}
                          row={row}
                          mapped={mapped}
                          selected={selected?.id === row.id}
                          onSelect={() => openDetail(row)}
                          onDelete={(e) => {
                            e.stopPropagation();
                            void handleDelete(row.id);
                          }}
                        />
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
          <SheetHeader className="p-6 pb-4 border-b border-border text-left">
            <SheetTitle className="font-display text-xl">
              {selected ? getGuestName(selected) : "Reservation"}
            </SheetTitle>
            <SheetDescription>Table reservation details</SheetDescription>
          </SheetHeader>

          <div className="p-6 flex-1">
            <AnimatePresence mode="wait">
              {selected && selectedReservation && (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <ReservationDetailPanel
                    reservation={selectedReservation}
                    allTables={RESTAURANT_TABLES}
                    onApprove={() => void handleStatusChange("confirmed")}
                    onDelete={() => void handleDelete(selected.id)}
                    isUpdating={updating}
                  />

                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Update status
                    </p>
                    <Select
                      value={selected.status}
                      onValueChange={(v) => void handleStatusChange(v)}
                      disabled={updating}
                    >
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button asChild variant="outline" className="w-full rounded-xl">
                    <Link to="/admin/reservations">Open floor plan</Link>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
