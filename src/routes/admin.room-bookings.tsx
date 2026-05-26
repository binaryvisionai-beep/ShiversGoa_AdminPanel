import { createFileRoute } from "@tanstack/react-router";
import BookingsPage from "@/pages/admin/Bookings";

export const Route = createFileRoute("/admin/room-bookings")({
  component: RoomBookingsRoute,
});

function RoomBookingsRoute() {
  return (
    <BookingsPage
      initialTypeFilter="room"
      title="Room Bookings"
      description="Website room booking clicks and guest interest — filter by date or status."
    />
  );
}
