import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import api from "../../api/client";

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [presenters, setPresenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", category: "", status: "ACTIVE", isRecurring: true, presenterId: "" });

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get("/admin/programs"), api.get("/admin/presenters")])
      .then(([p, pr]) => { setPrograms(p.data.data); setPresenters(pr.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", category: "", status: "ACTIVE", isRecurring: true, presenterId: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, slug: p.slug, description: p.description || "", category: p.category || "", status: p.status, isRecurring: p.isRecurring, presenterId: p.presenterId || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/programs/${editing.id}`, form);
      else await api.post("/admin/programs", form);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this program?")) return;
    try { await api.delete(`/admin/programs/${id}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Programs</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Program
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{editing ? "Edit Program" : "New Program"}</h2>
            <button onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Presenter</label>
              <select value={form.presenterId} onChange={(e) => setForm({ ...form, presenterId: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                <option value="">None</option>
                {presenters.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <div className="md:col-span-2 flex gap-2">
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
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Category</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Presenter</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr key={p.id} className="border-t border-gray-800">
                <td className="px-4 py-3 text-sm">{p.name}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{p.category || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{p.presenter?.fullName || "TBA"}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs ${p.status === "ACTIVE" ? "bg-green-600/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-white p-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-400 p-1 ml-2"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
