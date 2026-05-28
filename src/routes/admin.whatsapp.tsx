import { createFileRoute } from "@tanstack/react-router";
import WhatsAppAdminPage from "@/pages/admin/Whatsapp";

export const Route = createFileRoute("/admin/whatsapp")({
  component: WhatsAppAdminPage,
});
 