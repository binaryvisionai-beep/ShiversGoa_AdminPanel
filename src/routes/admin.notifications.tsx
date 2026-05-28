// import { createFileRoute } from "@tanstack/react-router";
// import { PlaceholderPage } from "@/components/admin/placeholder-page";

// export const Route = createFileRoute("/admin/notifications")({
//   component: () => (
//     <PlaceholderPage
//       title="Notification"
//       description="Manage alerts and push notifications for your team and guests."
//     />
//   ),
// });


import { createFileRoute } from "@tanstack/react-router";
import NotificationsPage from "@/pages/admin/Notifications";

export const Route = createFileRoute("/admin/notifications")({
  component: NotificationsPage,
});