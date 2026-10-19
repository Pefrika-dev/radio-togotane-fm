import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import api from "../../api/client";

export default function AdminPodcastsPage() {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", description: "", audioUrl: "", artworkUrl: "", duration: "", status: "DRAFT", presenterName: "", categoryId: "" });

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get("/admin/podcasts"), api.get("/admin/podcast-categories")])
      .then(([e, c]) => { setEpisodes(e.data.data); setCategories(c.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ title: "", slug: "", description: "", audioUrl: "", artworkUrl: "", duration: "", status: "DRAFT", presenterName: "", categoryId: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (ep: any) => {
    setEditing(ep);
    setForm({ title: ep.title, slug: ep.slug, description: ep.description || "", audioUrl: ep.audioUrl, artworkUrl: ep.artworkUrl || "", duration: ep.duration?.toString() || "", status: ep.status, presenterName: ep.presenterName || "", categoryId: ep.categoryId || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, duration: form.duration ? parseInt(form.duration) : null, categoryId: form.categoryId || null, publishedAt: form.status === "PUBLISHED" ? new Date().toISOString() : null };
      if (editing) await api.put(`/admin/podcasts/${editing.id}`, data);
      else await api.post("/admin/podcasts", data);
      resetForm();
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to save"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this episode?")) return;
    try { await api.delete(`/admin/podcasts/${id}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Podcast Episodes</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Episode
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{editing ? "Edit Episode" : "New Episode"}</h2>
            <button onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Audio URL</label>
                <input value={form.audioUrl} onChange={(e) => setForm({ ...form, audioUrl: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                  <option value="">None</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Presenter Name</label>
                <input value={form.presenterName} onChange={(e) => setForm({ ...form, presenterName: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Duration (seconds)</label>
                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Artwork URL</label>
                <input value={form.artworkUrl} onChange={(e) => setForm({ ...form, artworkUrl: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">Save</button>
              <button type="button" onClick={resetForm} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Category</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map((ep) => (
              <tr key={ep.id} className="border-t border-gray-800">
                <td className="px-4 py-3 text-sm">{ep.title}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{ep.category?.name || "-"}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs ${ep.status === "PUBLISHED" ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"}`}>{ep.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(ep)} className="text-gray-400 hover:text-white p-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(ep.id)} className="text-gray-400 hover:text-red-400 p-1 ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
