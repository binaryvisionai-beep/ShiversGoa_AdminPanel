import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useReservations } from "@/hooks/use-reservations";
import { useUpdateReservationStatus } from "@/hooks/use-update-reservation-status";
import {
  getReservationById,
  getReservationsForDate,
  getTablesWithStatus,
} from "@/lib/reservations/availability";
import { RESTAURANT_TABLES, VENUE_NAME, ZONE_LABELS } from "@/lib/reservations/tables";
import {
  buildEffectiveTimeSlots,
  formatTimeSlot,
  isDefaultTimeSlot,
} from "@/lib/reservations/time-slots";
import type { Reservation, RestaurantTable, ZoneFilter } from "@/lib/reservations/types";
import { cn } from "@/lib/utils";

import { AddTableDialog } from "./AddTableDialog";
import { ManageTimeSlotsDialog } from "./ManageTimeSlotsDialog";
import { ReservationDetailPanel } from "./reservation-detail-panel";
import { TableCard } from "./table-card";

const ZONES: ZoneFilter[] = ["all", "garden", "indoor", "terrace"];

const DEFAULT_DATE = format(new Date(), "yyyy-MM-dd");
const DEFAULT_TIME = "19:00";

type DeleteConfirm =
  | { mode: "single"; table: RestaurantTable }
  | { mode: "bulk"; zone: ZoneFilter; count: number }
  | { mode: "reservation"; reservation: Reservation }
  | { mode: "time"; slot: string }
  | { mode: "times-bulk"; count: number };

export function ReservationsPage() {
  const [date, setDate] = useState(DEFAULT_DATE);
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState(DEFAULT_TIME);
  const [zone, setZone] = useState<ZoneFilter>("all");
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [customTables, setCustomTables] = useState<RestaurantTable[]>([]);
  const [removedTableIds, setRemovedTableIds] = useState<Set<string>>(() => new Set());
  const [addTableOpen, setAddTableOpen] = useState(false);
  const [manageTimeOpen, setManageTimeOpen] = useState(false);
  const [customTimeSlots, setCustomTimeSlots] = useState<string[]>([]);
  const [removedTimeSlots, setRemovedTimeSlots] = useState<Set<string>>(() => new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { reservations, isError, refetch } = useReservations();
  const updateStatus = useUpdateReservationStatus();

  const allTables = useMemo(
    () => [...RESTAURANT_TABLES, ...customTables].filter((t) => !removedTableIds.has(t.id)),
    [customTables, removedTableIds],
  );

  const tablesInZoneScope = useMemo(
    () => allTables.filter((t) => zone === "all" || t.zone === zone),
    [allTables, zone],
  );

  const timeSlots = useMemo(
    () => buildEffectiveTimeSlots(customTimeSlots, removedTimeSlots),
    [customTimeSlots, removedTimeSlots],
  );

  useEffect(() => {
    if (timeSlots.length > 0 && !timeSlots.includes(time)) {
      setTime(timeSlots[0]);
    }
  }, [timeSlots, time]);

  const removeTimeSlots = useCallback((slots: string[]) => {
    if (slots.length === 0) return;
    setCustomTimeSlots((prev) => prev.filter((s) => !slots.includes(s)));
    setRemovedTimeSlots((prev) => {
      const next = new Set(prev);
      for (const slot of slots) {
        if (isDefaultTimeSlot(slot)) next.add(slot);
      }
      return next;
    });
  }, []);

  const removeTableIds = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      setCustomTables((prev) => prev.filter((t) => !ids.includes(t.id)));
      setRemovedTableIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
      if (selectedTableId && ids.includes(selectedTableId)) {
        setSelectedTableId(null);
        setSelectedReservationId(null);
      }
    },
    [selectedTableId],
  );

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.mode === "single") {
      removeTableIds([deleteConfirm.table.id]);
      toast.success(`Table "${deleteConfirm.table.name}" removed`);
    } else if (deleteConfirm.mode === "reservation") {
      const { reservation } = deleteConfirm;
      updateStatus.mutate(
        { id: reservation.id, status: "cancelled" },
        {
          onSuccess: () => {
            setDetailOpen(false);
            setSelectedReservationId(null);
            setSelectedTableId(null);
          },
        },
      );
    } else if (deleteConfirm.mode === "time") {
      removeTimeSlots([deleteConfirm.slot]);
      toast.success(`Removed ${formatTimeSlot(deleteConfirm.slot)}`);
    } else if (deleteConfirm.mode === "times-bulk") {
      removeTimeSlots(timeSlots);
      toast.success(`Removed ${deleteConfirm.count} time slots`);
    } else {
      const ids = allTables
        .filter((t) => deleteConfirm.zone === "all" || t.zone === deleteConfirm.zone)
        .map((t) => t.id);
      removeTableIds(ids);
      const label = ZONE_LABELS[deleteConfirm.zone];
      toast.success(
        deleteConfirm.zone === "all"
          ? `Removed ${ids.length} tables`
          : `Removed ${ids.length} ${label} tables`,
      );
    }
    setDeleteConfirm(null);
  };

  const tables = useMemo(
    () => getTablesWithStatus(date, time, guests, zone, allTables, reservations),
    [date, time, guests, zone, allTables, reservations],
  );

  const dayReservations = useMemo(
    () => getReservationsForDate(date, reservations),
    [date, reservations],
  );
  const selectedReservation = useMemo(
    () =>
      selectedReservationId
        ? getReservationById(selectedReservationId, reservations)
        : null,
    [selectedReservationId, reservations],
  );

  const openReservationDetail = (reservation: Reservation) => {
    setSelectedReservationId(reservation.id);
    setSelectedTableId(reservation.tableId);
    setTime(reservation.time);
    setDate(reservation.date);
    setDetailOpen(true);
  };

  const handleApproveReservation = () => {
    if (!selectedReservation || selectedReservation.status !== "pending") return;
    updateStatus.mutate({ id: selectedReservation.id, status: "confirmed" });
  };

  const handleTableSelect = (tableId: string, reservation?: Reservation) => {
    setSelectedTableId(tableId);
    if (reservation) {
      openReservationDetail(reservation);
    } else {
      setSelectedReservationId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
          <MapPin className="size-3.5" /> {VENUE_NAME}
        </p>
        <h1 className="font-display text-3xl md:text-4xl mt-1">Table</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          When are they joining? Track website bookings, tables, and guest details.
        </p>
      </div>

      {isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex flex-wrap items-center justify-between gap-2">
          <span>Could not load reservations. Check your connection and try again.</span>
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      <div className="space-y-4 min-w-0">
        {/* Time slots — manage via dialog only */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setManageTimeOpen(true)}
            className="h-9 rounded-xl"
          >
            <Pencil className="size-4" />
            Edit time slots
          </Button>
        </div>

        {/* Zone filter + add table */}
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {ZONES.map((z) => (
              <Button
                key={z}
                variant={zone === z ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-xl",
                  zone === z &&
                    "bg-gradient-amber border-0 text-primary-foreground shadow-glow",
                )}
                onClick={() => setZone(z)}
              >
                {ZONE_LABELS[z]}
              </Button>
            ))}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={tablesInZoneScope.length === 0}
              onClick={() =>
                setDeleteConfirm({
                  mode: "bulk",
                  zone,
                  count: tablesInZoneScope.length,
                })
              }
              className="h-10 w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive sm:min-w-[9.5rem] sm:w-auto"
            >
              <Trash2 className="size-4" />
              Delete tables
            </Button>
            <Button
              type="button"
              onClick={() => setAddTableOpen(true)}
              className="h-10 w-full rounded-xl border-0 bg-gradient-amber text-primary-foreground shadow-glow hover:opacity-95 sm:min-w-[9.5rem] sm:w-auto"
            >
              <Plus className="size-4" />
              Add table
            </Button>
          </div>
        </div>

        {/* Table grid */}
        <div>
          <div className="mb-3">
            <p className="text-sm font-medium">Table status</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(parseISO(date), "d MMM yyyy")} · {formatTimeSlot(time)} · {zone === "all" ? "All zones" : ZONE_LABELS[zone]}
            </p>
          </div>
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {tables.map((table, i) => (
                <TableCard
                  key={table.id}
                  table={table}
                  index={i}
                  selected={selectedTableId === table.id}
                  onSelect={() => handleTableSelect(table.id, table.reservation)}
                  onDelete={() =>
                    setDeleteConfirm({
                      mode: "single",
                      table: {
                        id: table.id,
                        name: table.name,
                        zone: table.zone,
                        seats: table.seats,
                        premium: table.premium,
                        details: table.details,
                      },
                    })
                  }
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <AddTableDialog
        open={addTableOpen}
        onOpenChange={setAddTableOpen}
        existingIds={allTables.map((t) => t.id)}
        onAdd={(table) => setCustomTables((prev) => [...prev, table])}
      />

      <ManageTimeSlotsDialog
        open={manageTimeOpen}
        onOpenChange={setManageTimeOpen}
        timeSlots={timeSlots}
        activeTime={time}
        dayReservations={dayReservations}
        onSelectTime={(slot) => {
          setTime(slot);
          setSelectedReservationId(null);
          setSelectedTableId(null);
        }}
        onAdd={(slot) => setCustomTimeSlots((prev) => [...prev, slot])}
        onRemove={(slot) => setDeleteConfirm({ mode: "time", slot })}
        onRequestRemoveAll={() =>
          setDeleteConfirm({ mode: "times-bulk", count: timeSlots.length })
        }
      />

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border px-6 py-5 text-left">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Reservation details
            </p>
            <SheetTitle className="font-display text-xl">Guest summary</SheetTitle>
            <SheetDescription className="sr-only">
              Full booking and guest information
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 px-6 py-5">
            {selectedReservation ? (
              <ReservationDetailPanel
                reservation={selectedReservation}
                allTables={allTables}
                isUpdating={updateStatus.isPending}
                onApprove={handleApproveReservation}
                onDelete={() =>
                  setDeleteConfirm({ mode: "reservation", reservation: selectedReservation })
                }
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              {deleteConfirm?.mode === "single"
                ? `Delete ${deleteConfirm.table.name}?`
                : deleteConfirm?.mode === "reservation"
                  ? `Delete reservation for ${deleteConfirm.reservation.guestName}?`
                  : deleteConfirm?.mode === "time"
                    ? `Delete ${formatTimeSlot(deleteConfirm.slot)}?`
                    : deleteConfirm?.mode === "times-bulk"
                      ? `Delete all ${deleteConfirm.count} time slots?`
                      : deleteConfirm?.zone === "all"
                        ? `Delete all ${deleteConfirm.count} tables?`
                        : `Delete ${deleteConfirm?.count} ${ZONE_LABELS[deleteConfirm?.zone ?? "all"]} tables?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.mode === "single" ? (
                <>
                  Remove this table from the floor map for this session. Reservations linked to it
                  may still appear in the list view.
                </>
              ) : deleteConfirm?.mode === "reservation" ? (
                <>
                  Remove this booking from the floor plan and lists for this session. This cannot be
                  undone until you refresh the page.
                </>
              ) : deleteConfirm?.mode === "time" ? (
                <>
                  Remove this time from the floor plan for this session. Existing reservations at
                  this time may still appear in lists.
                </>
              ) : deleteConfirm?.mode === "times-bulk" ? (
                <>
                  Remove every time slot from the floor plan for this session. This cannot be undone
                  until you refresh the page.
                </>
              ) : deleteConfirm?.zone === "all" ? (
                <>
                  Remove every table from the floor map for this session. This cannot be undone
                  until you refresh the page.
                </>
              ) : (
                <>
                  Remove all {ZONE_LABELS[deleteConfirm?.zone ?? "all"]} tables from the floor map
                  for this session.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
