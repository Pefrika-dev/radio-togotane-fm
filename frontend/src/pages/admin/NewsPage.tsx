import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Eye, EyeOff } from "lucide-react";
import api from "../../api/client";

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", status: "DRAFT", authorName: "Station Team", categoryId: "", featuredImageUrl: "" });

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get("/admin/news"), api.get("/admin/news-categories")])
      .then(([a, c]) => { setArticles(a.data.data); setCategories(c.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ title: "", slug: "", excerpt: "", content: "", status: "DRAFT", authorName: "Station Team", categoryId: "", featuredImageUrl: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (a: any) => {
    setEditing(a);
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt || "", content: a.content, status: a.status, authorName: a.authorName || "", categoryId: a.categoryId || "", featuredImageUrl: a.featuredImageUrl || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, categoryId: form.categoryId || null, publishedAt: form.status === "PUBLISHED" ? new Date().toISOString() : null };
      if (editing) await api.put(`/admin/news/${editing.id}`, data);
      else await api.post("/admin/news", data);
      resetForm();
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to save"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try { await api.delete(`/admin/news/${id}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  const togglePublish = async (a: any) => {
    try {
      await api.put(`/admin/news/${a.id}`, { status: a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED", publishedAt: a.status !== "PUBLISHED" ? new Date().toISOString() : null });
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || "Failed to update"); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">News Articles</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{editing ? "Edit Article" : "New Article"}</h2>
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
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                  <option value="">None</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Author</label>
                <input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Featured Image URL</label>
                <input value={form.featuredImageUrl} onChange={(e) => setForm({ ...form, featuredImageUrl: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Content</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none" required />
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
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Date</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-t border-gray-800">
                <td className="px-4 py-3 text-sm">{a.title}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{a.category?.name || "-"}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs ${a.status === "PUBLISHED" ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"}`}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => togglePublish(a)} className="text-gray-400 hover:text-white p-1" title={a.status === "PUBLISHED" ? "Unpublish" : "Publish"}>
                    {a.status === "PUBLISHED" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleEdit(a)} className="text-gray-400 hover:text-white p-1 ml-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-400 p-1 ml-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
