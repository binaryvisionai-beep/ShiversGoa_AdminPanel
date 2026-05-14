import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/restaurant")({
  component: () => (
    <PlaceholderPage
      title="Restaurant"
      description="Aurelia dining room — covers, tables, and tonight's service."
    />
  ),
});
