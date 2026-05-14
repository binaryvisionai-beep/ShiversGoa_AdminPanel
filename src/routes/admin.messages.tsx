import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/messages")({
  component: () => (
    <PlaceholderPage
      title="Messages"
      description="Concierge inbox for guest correspondence and team threads."
    />
  ),
});
