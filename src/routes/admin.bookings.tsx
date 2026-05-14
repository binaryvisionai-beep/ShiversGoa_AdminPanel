import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/bookings")({
  component: () => (
    <PlaceholderPage
      title="Bookings"
      description="Manage current and upcoming guest reservations across every suite, villa, and loft."
    />
  ),
});
