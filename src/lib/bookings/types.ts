import type { Reservation } from "@/lib/reservations/types";

export type BookingType = "table" | "room" | "events";
export type DateRangePreset = "today" | "7d" | "30d" | "all";
export type BookingSort = "newest" | "oldest" | "name" | "visit" | "type" | "events";
export type TypeFilter = "all" | BookingType;
export type StatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "intent"
  | "enquiry";

export type UnifiedBooking = {
  id: string;
  type: BookingType;
  clientName: string;
  status: string;
  visitDate: string;
  visitTime?: string;
  guests?: number;
  detail: string;
  subdetail?: string;
  phone?: string;
  email?: string;
  source?: string;
  referenceCode?: string;
  notes?: string;
  createdAt: string;
  /** Present when type is table — used for detail panel & status updates */
  reservation?: Reservation;
};
