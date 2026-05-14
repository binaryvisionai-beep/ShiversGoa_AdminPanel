import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/analytics")({
  component: () => (
    <PlaceholderPage
      title="Analytics"
      description="Deep performance signals across revenue, occupancy, and loyalty."
    />
  ),
});
