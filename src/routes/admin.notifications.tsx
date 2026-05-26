import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/notifications")({
  component: () => (
    <PlaceholderPage
      title="Notification"
      description="Manage alerts and push notifications for your team and guests."
    />
  ),
});
