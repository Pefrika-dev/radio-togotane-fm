import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import api from "../../api/client";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/admin/settings").then((r) => { setSettings(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.put("/admin/settings", settings);
      setMessage("Settings saved successfully!");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: any) => setSettings({ ...settings, [key]: value });

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  const fields = [
    { key: "stationName", label: "Station Name", type: "text" },
    { key: "frequency", label: "Frequency", type: "text" },
    { key: "tagline", label: "Tagline", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "address", label: "Address", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "whatsappNumber", label: "WhatsApp Number", type: "text" },
    { key: "timezone", label: "Timezone", type: "text" },
    { key: "streamUrl", label: "Stream URL", type: "text" },
    { key: "streamType", label: "Stream Type", type: "select", options: ["direct", "zeno_embed", "external"] },
    { key: "seoTitle", label: "SEO Title", type: "text" },
    { key: "seoDescription", label: "SEO Description", type: "textarea" },
    { key: "footerText", label: "Footer Text", type: "text" },
    { key: "socialFacebook", label: "Facebook URL", type: "url" },
    { key: "socialTwitter", label: "Twitter URL", type: "url" },
    { key: "socialInstagram", label: "Instagram URL", type: "url" },
    { key: "socialYoutube", label: "YouTube URL", type: "url" },
    { key: "socialTiktok", label: "TikTok URL", type: "url" },
    { key: "logoUrl", label: "Logo URL", type: "text" },
    { key: "faviconUrl", label: "Favicon URL", type: "text" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Station Settings</h1>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-900/30 border border-green-700 text-green-300" : "bg-red-900/30 border border-red-700 text-red-300"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
              <label className="block text-sm text-gray-400 mb-1">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea value={settings?.[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none" />
              ) : f.type === "select" ? (
                <select value={settings?.[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} value={settings?.[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              )}
            </div>
          ))}
        </div>
        <button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
