import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/rooms")({
  component: () => (
    <PlaceholderPage
      title="Rooms"
      description="Inventory, status, and curated availability for each space on the estate."
    />
  ),
});
