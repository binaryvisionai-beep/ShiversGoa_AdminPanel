import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <PlaceholderPage
      title="Settings"
      description="Estate configuration, branding, and integrations."
    />
  ),
});
