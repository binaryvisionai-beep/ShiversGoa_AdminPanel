import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/events")({
  component: () => (
    <PlaceholderPage
      title="Events"
      description="Private galas, weddings, and bespoke estate gatherings."
    />
  ),
});
