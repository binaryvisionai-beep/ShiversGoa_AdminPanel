import { createFileRoute } from "@tanstack/react-router";
import ReviewsPage from "@/pages/admin/Reviews";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});