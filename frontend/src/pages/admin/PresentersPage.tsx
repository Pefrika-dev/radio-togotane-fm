import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import api from "../../api/client";

export default function AdminPresentersPage() {
  const [presenters, setPresenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ fullName: "", slug: "", bio: "", photoUrl: "", isActive: true });

  const fetchData = () => {
    setLoading(true);
    api.get("/admin/presenters").then((r) => { setPresenters(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ fullName: "", slug: "", bio: "", photoUrl: "", isActive: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({ fullName: p.fullName, slug: p.slug, bio: p.bio || "", photoUrl: p.photoUrl || "", isActive: p.isActive });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/presenters/${editing.id}`, form);
      else await api.post("/admin/presenters", form);
      resetForm();
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to save"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this presenter?")) return;
    try { await api.delete(`/admin/presenters/${id}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Presenters</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Presenter
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{editing ? "Edit Presenter" : "New Presenter"}</h2>
            <button onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Photo URL</label>
              <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Active</label>
              <select value={form.isActive ? "true" : "false"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">Save</button>
              <button type="button" onClick={resetForm} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presenters.map((p) => (
          <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{p.fullName}</h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{p.bio || "No bio"}</p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${p.isActive ? "bg-green-600/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>{p.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-white p-1"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
