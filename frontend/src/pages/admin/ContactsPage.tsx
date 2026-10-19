import { useEffect, useState } from "react";
import { CheckCircle, Trash2 } from "lucide-react";
import api from "../../api/client";

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    api.get(`/admin/contact-messages?${params}`).then((r) => {
      setMessages(r.data.data);
      setTotalPages(r.data.pagination?.totalPages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, statusFilter, search]);

  const updateStatus = async (id: string, status: string) => {
    try { await api.patch(`/admin/contact-messages/${id}/status`, { status }); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try { await api.delete(`/admin/contact-messages/${id}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || "Failed"); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Contact Messages</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500">
          <option value="">All Status</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No messages found.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`bg-gray-900 border rounded-xl p-5 ${m.status === "UNREAD" ? "border-red-600/50" : "border-gray-800"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{m.subject}</h3>
                  <p className="text-sm text-gray-400">From: {m.name} {m.email && `(${m.email})`} {m.phone && `• ${m.phone}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${m.status === "UNREAD" ? "bg-red-600/20 text-red-400" : m.status === "READ" ? "bg-green-600/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>{m.status}</span>
                  <button onClick={() => updateStatus(m.id, m.status === "UNREAD" ? "READ" : "UNREAD")} className="text-gray-400 hover:text-white p-1" title="Toggle read">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{m.message}</p>
              <p className="text-gray-500 text-xs mt-3">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50">Prev</button>
          <span className="px-4 py-2 text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
