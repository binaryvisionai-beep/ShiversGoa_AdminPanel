import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Save, MessageCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

type WhatsAppSettings = {
  id: string;
  phone_number: string;
  welcome_message: string;
  is_enabled: boolean;
};

export default function WhatsAppAdminPage() {
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("whatsapp_settings")
      .select("*")
      .single();
    if (data) setSettings(data);
    setLoading(false);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("whatsapp_settings")
      .update({
        phone_number: settings.phone_number,
        welcome_message: settings.welcome_message,
        is_enabled: settings.is_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);

    setSaving(false);
    if (error) {
      alert("Failed to save");
      return;
    }
    setMessage("Saved successfully");
    setTimeout(() => setMessage(""), 3000);
  };

  const waLink = settings
    ? `https://wa.me/${settings.phone_number}?text=${encodeURIComponent(settings.welcome_message)}`
    : "#";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Loading...
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">WhatsApp Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Control the WhatsApp floating button shown on the main site.
          </p>
        </div>
        {message && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="size-4" /> {message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings form */}
        <div className="rounded-3xl border bg-background p-6 space-y-6">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">WhatsApp Button</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Show or hide the floating button on the main site
              </p>
            </div>
            <button
              onClick={() =>
                setSettings((s) => s ? { ...s, is_enabled: !s.is_enabled } : s)
              }
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                settings.is_enabled ? "bg-green-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 left-1 size-4 rounded-full bg-white shadow transition-transform duration-300 ${
                  settings.is_enabled ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-border" />

          {/* Phone number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Phone Number
              <span className="text-xs text-muted-foreground font-normal ml-2">
                Country code + number, no + or spaces
              </span>
            </label>
            <input
              type="text"
              value={settings.phone_number}
              onChange={(e) =>
                setSettings((s) => s ? { ...s, phone_number: e.target.value } : s)
              }
              placeholder="919860698281"
              className="w-full h-12 rounded-2xl border px-4 bg-background text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Example: 919860698281 (91 = India code, then mobile number)
            </p>
          </div>

          {/* Welcome message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pre-filled Welcome Message</label>
            <textarea
              rows={4}
              value={settings.welcome_message}
              onChange={(e) =>
                setSettings((s) => s ? { ...s, welcome_message: e.target.value } : s)
              }
              placeholder="Hello! I would like to know more about Shivers."
              className="w-full rounded-2xl border p-4 bg-background text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This message auto-fills when a visitor taps the WhatsApp button.
            </p>
          </div>

          {/* Save */}
          <button
            onClick={save}
            disabled={saving}
            className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-70 hover:opacity-90 transition-opacity"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Preview */}
        <div className="rounded-3xl border bg-background p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Preview</h2>
            <button
              onClick={() => setShowPreview((s) => !s)}
              className="h-9 px-3 rounded-xl border text-sm inline-flex items-center gap-2 hover:bg-muted"
            >
              {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showPreview ? "Hide" : "Show"} preview
            </button>
          </div>

          {showPreview && (
            <div className="rounded-2xl bg-muted/40 border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg">
                  <MessageCircle className="size-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">WhatsApp Floating Button</p>
                  <p className="text-xs text-muted-foreground">Bottom-right of screen</p>
                </div>
                <span
                  className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${
                    settings.is_enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {settings.is_enabled ? "Visible" : "Hidden"}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Links to:</p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary break-all hover:underline"
                >
                  {waLink}
                </a>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pre-filled message:</p>
                <p className="text-sm bg-white rounded-xl p-3 border">
                  {settings.welcome_message || "—"}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-2xl bg-muted/40 p-5 space-y-3">
            <p className="text-sm font-medium">Setup Instructions</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Update <code className="bg-muted px-1 rounded text-xs">WhatsAppFab.tsx</code> to load number from Supabase</li>
              <li>Save your phone number above</li>
              <li>Test by clicking the WhatsApp button on the main site</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}