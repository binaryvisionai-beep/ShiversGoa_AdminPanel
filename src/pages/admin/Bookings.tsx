import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { format, formatDistanceToNow, isToday, isWithinInterval, parseISO, subDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  CalendarCheck,
  Filter,
  Loader2,
  Search,
  SlidersHorizontal,
  PartyPopper,
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
import { fetchAllBookings, mapReservationToBooking } from "@/lib/bookings/fetch-all-bookings";
import type {
  BookingSort,
  BookingType,
  DateRangePreset,
  StatusFilter,
  TypeFilter,
  UnifiedBooking,
} from "@/lib/bookings/types";
import { RESTAURANT_TABLES } from "@/lib/reservations/tables";
import { formatTimeSlot } from "@/lib/reservations/time-slots";
import type { Reservation } from "@/lib/reservations/types";
import { mapDbRowToReservation } from "@/lib/reservations/map-reservation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

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

function StatusBadge({ status }: { status: string }) {
  const s = normalizeStatus(status);
  const map: Record<string, string> = {
    confirmed: "bg-primary/10 text-primary border-primary/20",
    pending: "bg-gold/15 text-bronze border-gold/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    completed: "bg-muted text-muted-foreground border-border",
    intent: "bg-secondary text-secondary-foreground border-border",
    enquiry: "bg-gold/10 text-bronze border-gold/25",
  };
  return (
    <Badge variant="outline" className={cn("rounded-full font-normal capitalize", map[s] ?? "")}>
      <span className="size-1.5 rounded-full bg-current mr-1.5" />
      {s === "intent" ? "Booking click" : s === "enquiry" ? "Enquiry" : s}
    </Badge>
  );
}

const TYPE_LABELS: Record<BookingType, string> = {
  table: "Table",
  room: "Room",
  events: "Events",
};

function TypeBadge({ type }: { type: BookingType }) {
  const styles: Record<BookingType, string> = {
    table: "border-primary/25 text-primary",
    room: "border-bronze/30 text-bronze",
    events: "border-gold/35 text-bronze",
  };
  const Icon =
    type === "table" ? UtensilsCrossed : type === "room" ? BedDouble : PartyPopper;
  return (
    <Badge variant="outline" className={cn("rounded-full gap-1 font-normal", styles[type])}>
      <Icon className="size-3" />
      {TYPE_LABELS[type]}
    </Badge>
  );
}

const selectTriggerClass =
  "h-9 rounded-lg text-sm shrink-0 w-full sm:w-auto sm:min-w-[7.5rem] lg:min-w-0";

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

function BookingRow({
  booking,
  onSelect,
  selected,
}: {
  booking: UnifiedBooking;
  onSelect: () => void;
  selected: boolean;
}) {
  const initials = booking.clientName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.tr
      layout
      variants={rowVariants}
      onClick={onSelect}
      className={cn(
        "border-b border-border/80 cursor-pointer transition-colors hover:bg-muted/40",
        selected && "bg-primary/5",
        booking.status === "cancelled" && "opacity-60",
      )}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-full bg-gradient-gold flex items-center justify-center text-xs font-semibold text-coffee shrink-0">
            {initials || "?"}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{booking.clientName}</p>
            {booking.referenceCode && (
              <p className="text-xs text-muted-foreground">{booking.referenceCode}</p>
            )}
            {booking.type === "room" && (
              <p className="text-xs text-muted-foreground">Room booking click</p>
            )}
            {booking.type === "events" && (
              <p className="text-xs text-muted-foreground">Event enquiry</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <TypeBadge type={booking.type} />
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <p className="font-medium">{format(parseISO(booking.visitDate), "EEE, d MMM")}</p>
        {booking.visitTime && (
          <p className="text-xs text-muted-foreground">{formatTimeSlot(booking.visitTime)}</p>
        )}
      </td>
      <td className="px-4 py-3.5 min-w-0 max-w-[200px]">
        <p className="truncate font-medium">{booking.detail}</p>
        {booking.subdetail && (
          <p className="text-xs text-muted-foreground truncate">{booking.subdetail}</p>
        )}
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap hidden lg:table-cell">
        {formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}
      </td>
    </motion.tr>
  );
}

function BookingCard({
  booking,
  onSelect,
  selected,
}: {
  booking: UnifiedBooking;
  onSelect: () => void;
  selected: boolean;
}) {
  const initials = booking.clientName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          <p className="font-medium truncate">{booking.clientName}</p>
          <StatusBadge status={booking.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <TypeBadge type={booking.type} />
          <span className="text-xs text-muted-foreground">
            {format(parseISO(booking.visitDate), "d MMM")}
            {booking.visitTime ? ` · ${formatTimeSlot(booking.visitTime)}` : ""}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 truncate">{booking.detail}</p>
      </div>
    </motion.button>
  );
}

type BookingsPageProps = {
  initialTypeFilter?: TypeFilter;
  title?: string;
  description?: string;
};

export default function BookingsPage({
  initialTypeFilter = "all",
  title = "Bookings",
  description = "Every table reservation, room interest, and event enquiry — filter by date, type, status, or guest name.",
}: BookingsPageProps) {
  const [bookings, setBookings] = useState<UnifiedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UnifiedBooking | null>(null);
  const [updating, setUpdating] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangePreset>("7d");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialTypeFilter);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<BookingSort>("newest");
  const [showFilters, setShowFilters] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllBookings();
      setBookings(data);
    } catch (e) {
      console.error(e);
      toast.error("Could not load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return {
      today: bookings.filter((b) => b.visitDate === todayStr && b.type === "table").length,
      pending: bookings.filter((b) => normalizeStatus(b.status) === "pending").length,
      confirmed: bookings.filter((b) => normalizeStatus(b.status) === "confirmed").length,
      total: bookings.length,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = bookings.filter((b) => {
      if (!inDateRange(b.visitDate, dateRange)) return false;
      if (typeFilter !== "all" && b.type !== typeFilter) return false;
      if (statusFilter !== "all" && normalizeStatus(b.status) !== statusFilter) return false;
      if (q && !b.clientName.toLowerCase().includes(q)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "type") {
        const byType = TYPE_LABELS[a.type].localeCompare(TYPE_LABELS[b.type]);
        if (byType !== 0) return byType;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === "events") {
        if (a.type === "events" && b.type !== "events") return -1;
        if (b.type === "events" && a.type !== "events") return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === "name") return a.clientName.localeCompare(b.clientName);
      if (sort === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "visit") {
        const da = `${a.visitDate}T${a.visitTime ?? "00:00"}`;
        const db = `${b.visitDate}T${b.visitTime ?? "00:00"}`;
        return da.localeCompare(db);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [bookings, search, dateRange, typeFilter, statusFilter, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    dateRange !== "7d" ||
    typeFilter !== initialTypeFilter ||
    statusFilter !== "all" ||
    sort !== "newest";

  const clearFilters = () => {
    setSearch("");
    setDateRange("7d");
    setTypeFilter(initialTypeFilter);
    setStatusFilter("all");
    setSort("newest");
  };

  const openDetail = (b: UnifiedBooking) => {
    setSelected(b);
    setSheetOpen(true);
  };

  const refreshReservation = (updated: Reservation) => {
    const mapped = mapReservationToBooking(updated);
    setBookings((prev) => prev.map((b) => (b.id === mapped.id ? mapped : b)));
    setSelected(mapped);
  };

  const handleStatusChange = async (status: string) => {
    if (!selected?.reservation) return;
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from("restaurant_reservations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", selected.reservation.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      refreshReservation(mapDbRowToReservation(data));
      toast.success("Status updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async () => {
    await handleStatusChange("confirmed");
  };

  const handleCancel = async () => {
    await handleStatusChange("cancelled");
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
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Operations</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl mt-1">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-xl">{description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            className="rounded-xl h-11"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Refresh
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          label="Today's Reservations"
          description="All bookings happening today"
          value={stats.today}
          accent="amber"
        />
        <StatCard
          label="Pending Requests"
          description="Awaiting approval/action"
          value={stats.pending}
        />
        <StatCard
          label="Confirmed Bookings"
          description="Confirmed reservations/bookings"
          value={stats.confirmed}
        />
        <StatCard
          label="Total Bookings"
          description="All records"
          value={stats.total}
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
                  <Label htmlFor="booking-search" className="sr-only">
                    Search by client name
                  </Label>
                  <div className="relative w-full sm:w-40 lg:w-44 shrink-0">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      id="booking-search"
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Name..."
                      className="w-full h-9 pl-8 pr-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <Label htmlFor="booking-date" className="sr-only">
                    Visit date
                  </Label>
                  <Select
                    value={dateRange}
                    onValueChange={(v) => setDateRange(v as DateRangePreset)}
                  >
                    <SelectTrigger
                      id="booking-date"
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

                  <Label htmlFor="booking-type" className="sr-only">
                    Booking type
                  </Label>
                  <Select
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v as TypeFilter)}
                  >
                    <SelectTrigger
                      id="booking-type"
                      className={cn(selectTriggerClass, "lg:w-[6.5rem]")}
                    >
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="table">Table</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                    </SelectContent>
                  </Select>

                  <Label htmlFor="booking-status" className="sr-only">
                    Status
                  </Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                  >
                    <SelectTrigger
                      id="booking-status"
                      className={cn(selectTriggerClass, "lg:w-[8.5rem]")}
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="intent">Room click</SelectItem>
                      <SelectItem value="enquiry">Event enquiry</SelectItem>
                    </SelectContent>
                  </Select>

                  <Label htmlFor="booking-sort" className="sr-only">
                    Sort by
                  </Label>
                  <Select value={sort} onValueChange={(v) => setSort(v as BookingSort)}>
                    <SelectTrigger
                      id="booking-sort"
                      className={cn(selectTriggerClass, "lg:w-[10.5rem]")}
                    >
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="visit">Visit soonest</SelectItem>
                      <SelectItem value="name">Name A–Z</SelectItem>
                      <SelectItem value="type">Booking type</SelectItem>
                      <SelectItem value="events">Events first</SelectItem>
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
            <span className="font-medium text-foreground">{filtered.length}</span> booking
            {filtered.length !== 1 ? "s" : ""}
          </span>
          {loading && (
            <span className="flex items-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="size-3.5 animate-spin" /> Loading…
            </span>
          )}
        </div>

        {loading && bookings.length === 0 ? (
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
            <CalendarCheck className="size-12 mx-auto text-muted-foreground/40" />
            <h3 className="font-display text-xl mt-4">No bookings match</h3>
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
                  {filtered.map((b) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      selected={selected?.id === b.id}
                      onSelect={() => openDetail(b)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border">
                    <th className="px-4 py-3 font-medium">Guest</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Visit</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Booked</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.map((b) => (
                      <BookingRow
                        key={b.id}
                        booking={b}
                        selected={selected?.id === b.id}
                        onSelect={() => openDetail(b)}
                      />
                    ))}
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
              {selected?.clientName ?? "Booking"}
            </SheetTitle>
            <SheetDescription>
              {selected?.type === "table"
                ? "Table reservation"
                : selected?.type === "events"
                  ? "Event enquiry"
                  : "Room booking interest"}
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 flex-1">
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {selected.type === "table" && selected.reservation ? (
                    <div className="space-y-5">
                      <ReservationDetailPanel
                        reservation={selected.reservation}
                        allTables={RESTAURANT_TABLES}
                        onApprove={() => void handleApprove()}
                        onDelete={() => void handleCancel()}
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
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button asChild variant="outline" className="w-full rounded-xl">
                        <Link to="/admin/reservations">Open floor plan</Link>
                      </Button>
                    </div>
                  ) : selected.type === "events" ? (
                    <div className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        <TypeBadge type="events" />
                        <StatusBadge status="enquiry" />
                      </div>
                      <div className="rounded-xl border bg-muted/30 p-4 space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Submitted</span>
                          <span className="font-medium">
                            {format(parseISO(selected.createdAt), "PPp")}
                          </span>
                        </div>
                        {selected.phone && (
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Phone</span>
                            <span className="font-medium">{selected.phone}</span>
                          </div>
                        )}
                        {selected.email && (
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium text-right break-all">{selected.email}</span>
                          </div>
                        )}
                      </div>
                      {selected.notes && (
                        <div className="rounded-xl border border-border p-4 text-sm">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            Message
                          </p>
                          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {selected.notes}
                          </p>
                        </div>
                      )}
                      <Button asChild className="w-full rounded-xl bg-gradient-amber border-0 text-primary-foreground">
                        <Link to="/admin/events">View events</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        <TypeBadge type="room" />
                        <StatusBadge status="intent" />
                      </div>
                      <div className="rounded-xl border bg-muted/30 p-4 space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Room</span>
                          <span className="font-medium text-right">{selected.detail}</span>
                        </div>
                        {selected.subdetail && (
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Category</span>
                            <span className="font-medium text-right">{selected.subdetail}</span>
                          </div>
                        )}
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">When</span>
                          <span className="font-medium">
                            {format(parseISO(selected.createdAt), "PPp")}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        This is a website “book now” click, not a confirmed stay. Manage room
                        content under{" "}
                        <Link to="/admin/rooms" className="text-primary font-medium hover:underline">
                          Rooms
                        </Link>
                        .
                      </p>
                      <Button asChild className="w-full rounded-xl bg-gradient-amber border-0 text-primary-foreground">
                        <Link to="/admin/rooms">View rooms</Link>
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
