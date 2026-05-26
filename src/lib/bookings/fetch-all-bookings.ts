import type { Reservation } from "@/lib/reservations/types";
import { fetchReservations } from "@/lib/reservations/fetch-reservations";
import { supabase } from "@/lib/supabase";
import type { UnifiedBooking } from "./types";

type RoomClickRow = {
  id: string;
  room_name: string;
  category: string;
  cta: string;
  created_at: string;
};

export function mapReservationToBooking(r: Reservation): UnifiedBooking {
  const tablePart = r.tableLabel || r.tableId;
  const zonePart = r.tableZone ? ` · ${r.tableZone}` : "";
  return {
    id: `table-${r.id}`,
    type: "table",
    clientName: r.guestName || "Guest",
    status: (r.status || "pending").toLowerCase(),
    visitDate: r.date,
    visitTime: r.time,
    guests: r.guests,
    detail: `${tablePart}${zonePart}`,
    subdetail: r.guests ? `${r.guests} guests` : undefined,
    phone: r.phone,
    email: r.email,
    source: r.source,
    createdAt: r.createdAt,
    reservation: r,
  };
}

function mapRoomClickToBooking(row: RoomClickRow): UnifiedBooking {
  const visitDate = row.created_at.split("T")[0] ?? row.created_at;
  return {
    id: `room-${row.id}`,
    type: "room",
    clientName: "Website visitor",
    status: "intent",
    visitDate,
    detail: row.room_name,
    subdetail: row.category ? `${row.category} · ${row.cta || "Book now"}` : row.cta,
    source: "website",
    createdAt: row.created_at,
  };
}

type EventFormRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
};

function mapEventFormToBooking(row: EventFormRow): UnifiedBooking {
  const visitDate = row.created_at.split("T")[0] ?? row.created_at;
  return {
    id: `event-${row.id}`,
    type: "events",
    clientName: row.name || "Guest",
    status: "enquiry",
    visitDate,
    detail: "Event enquiry",
    subdetail: row.message ? row.message.slice(0, 100) : undefined,
    phone: row.phone,
    email: row.email,
    notes: row.message,
    source: "website",
    createdAt: row.created_at,
  };
}

async function fetchEventEnquiries(): Promise<UnifiedBooking[]> {
  const { data, error } = await supabase
    .from("events_event_forms")
    .select("id, name, email, phone, message, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map(mapEventFormToBooking);
}

async function fetchRoomBookingClicks(): Promise<UnifiedBooking[]> {
  const { data, error } = await supabase
    .from("room_booking_clicks")
    .select("id, room_name, category, cta, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map(mapRoomClickToBooking);
}

export async function fetchAllBookings(): Promise<UnifiedBooking[]> {
  const [tables, rooms, events] = await Promise.all([
    fetchReservations(),
    fetchRoomBookingClicks(),
    fetchEventEnquiries(),
  ]);
  const unified = [...tables.map(mapReservationToBooking), ...rooms, ...events];
  unified.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return unified;
}
