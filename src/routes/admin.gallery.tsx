import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/placeholder-page";

export const Route = createFileRoute("/admin/gallery")({
  component: () => (
    <PlaceholderPage
      title="Gallery"
      description="Visual library powering the public site and brand campaigns."
    />
  ),
});
