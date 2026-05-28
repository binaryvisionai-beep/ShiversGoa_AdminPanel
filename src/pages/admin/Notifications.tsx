import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  CalendarCheck,
  UtensilsCrossed,
  Star,
  MessageSquare,
  Info,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "booking" | "reservation" | "enquiry" | "review";
  is_read: boolean;
  link: string | null;
  created_at: string;
};

const TYPE_ICON: Record<Notification["type"], React.ElementType> = {
  booking: CalendarCheck,
  reservation: UtensilsCrossed,
  review: Star,
  enquiry: MessageSquare,
  info: Info,
};

const TYPE_COLOR: Record<Notification["type"], string> = {
  booking: "bg-blue-100 text-blue-600",
  reservation: "bg-green-100 text-green-600",
  review: "bg-yellow-100 text-yellow-600",
  enquiry: "bg-purple-100 text-purple-600",
  info: "bg-gray-100 text-gray-600",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    load();

    // Realtime subscription
    const channel = supabase
      .channel("admin_notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_notifications" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  };

  const markRead = async (id: string) => {
    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllRead = async () => {
    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const deleteOne = async (id: string) => {
    await supabase.from("admin_notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteAll = async () => {
    if (!confirm("Delete all notifications?")) return;
    await supabase.from("admin_notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setNotifications([]);
  };

  const visible =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time alerts for bookings, reservations, reviews and enquiries.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="h-10 px-4 rounded-xl border text-sm inline-flex items-center gap-2 hover:bg-muted transition-colors disabled:opacity-40"
          >
            <CheckCheck className="size-4" /> Mark all read
          </button>
          <button
            onClick={deleteAll}
            disabled={notifications.length === 0}
            className="h-10 px-4 rounded-xl border text-sm inline-flex items-center gap-2 hover:bg-muted transition-colors disabled:opacity-40 text-destructive"
          >
            <Trash2 className="size-4" /> Clear all
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-9 px-4 rounded-xl text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "border hover:bg-muted"
            }`}
          >
            {f === "all" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-3xl border bg-background overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" /> Loading...
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Bell className="size-10 opacity-30" />
            <p className="text-sm">No {filter === "unread" ? "unread " : ""}notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Info;
              return (
                <li
                  key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                    !n.is_read ? "bg-muted/30" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 size-10 rounded-2xl flex items-center justify-center shrink-0 ${TYPE_COLOR[n.type]}`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      {!n.is_read && (
                        <span className="size-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="size-9 rounded-xl border flex items-center justify-center hover:bg-muted transition-colors"
                        title="Mark as read"
                      >
                        <Check className="size-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(n.id)}
                      className="size-9 rounded-xl border flex items-center justify-center hover:bg-muted transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}