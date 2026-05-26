import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Reservation } from "@/lib/reservations/types";
import { formatTimeSlot, normalizeTimeSlot } from "@/lib/reservations/time-slots";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  time: z
    .string()
    .min(1, "Select a time")
    .refine((v) => normalizeTimeSlot(v) !== null, "Enter a valid time"),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeSlots: string[];
  activeTime?: string;
  dayReservations: Reservation[];
  onSelectTime?: (slot: string) => void;
  onAdd: (slot: string) => void;
  onRemove: (slot: string) => void;
  onRequestRemoveAll: () => void;
};

export function ManageTimeSlotsDialog({
  open,
  onOpenChange,
  timeSlots,
  activeTime,
  dayReservations,
  onSelectTime,
  onAdd,
  onRemove,
  onRequestRemoveAll,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { time: "19:00" },
  });

  const bookingCountBySlot = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of dayReservations) {
      if (r.status === "cancelled") continue;
      counts[r.time] = (counts[r.time] ?? 0) + 1;
    }
    return counts;
  }, [dayReservations]);

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset({ time: "19:00" });
    onOpenChange(next);
  };

  const onSubmit = (values: FormValues) => {
    const slot = normalizeTimeSlot(values.time);
    if (!slot) return;
    if (timeSlots.includes(slot)) {
      toast.error(`${formatTimeSlot(slot)} is already listed`);
      return;
    }
    onAdd(slot);
    toast.success(`Added ${formatTimeSlot(slot)}`);
    form.reset({ time: "19:00" });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,32rem)] max-w-md flex-col gap-0 overflow-hidden rounded-2xl border-border p-0">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5 text-left">
          <DialogTitle className="font-display text-xl">Manage time slots</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            View, add, or remove service times. Tap a slot to show it on the floor plan. Changes
            apply for this session only.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="shrink-0 flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-end"
          >
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-2">
                  <FormLabel>Add time</FormLabel>
                  <FormControl>
                    <Input type="time" step={1800} className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-11 shrink-0 rounded-xl border-0 bg-gradient-amber text-primary-foreground shadow-glow sm:mb-0"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Plus className="size-4" /> Add
                </>
              )}
            </Button>
          </form>
        </Form>

        <ScrollArea className="min-h-0 flex-1 px-6 py-4">
          {timeSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
              <Clock className="mb-3 size-8 opacity-40" />
              <p>No time slots yet.</p>
              <p className="mt-1">Add a time above to get started.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {timeSlots.map((slot) => {
                const bookings = bookingCountBySlot[slot] ?? 0;
                const isActive = activeTime === slot;
                return (
                  <li
                    key={slot}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-muted/20",
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => onSelectTime?.(slot)}
                    >
                      <p className="font-medium">{formatTimeSlot(slot)}</p>
                      {bookings > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {bookings} booking{bookings === 1 ? "" : "s"} today
                        </p>
                      )}
                      {isActive && (
                        <p className="text-xs text-primary mt-0.5">Showing on floor plan</p>
                      )}
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      {bookings > 0 && (
                        <Badge variant="outline" className="rounded-full font-normal text-xs">
                          In use
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${formatTimeSlot(slot)}`}
                        onClick={() => onRemove(slot)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>

        <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={timeSlots.length === 0}
            onClick={onRequestRemoveAll}
            className="h-11 w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
          >
            <Trash2 className="size-4" />
            Remove all
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl sm:w-auto"
            onClick={() => handleOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
