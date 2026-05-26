import { createFileRoute } from "@tanstack/react-router";
import BookingsPage from "@/pages/admin/Bookings";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});
