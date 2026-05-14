import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/reservations")({
  component: () => (
    <PlaceholderPage
      title="Reservations"
      description="Restaurant, spa, and experience reservations curated for every guest."
    />
  ),
});
