import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <PlaceholderPage
      title="Users"
      description="Staff, concierge teams, and access controls."
    />
  ),
});
