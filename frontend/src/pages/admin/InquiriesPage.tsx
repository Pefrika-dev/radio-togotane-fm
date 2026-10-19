import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../../api/client";

const STATUS_OPTIONS = ["NEW", "CONTACTED", "IN_PROGRESS", "CLOSED", "LOST"];

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    api.get(`/admin/advertising-inquiries?${params}`).then((r) => {
      setInquiries(r.data.data);
      setTotalPages(r.data.pagination?.totalPages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try { await api.patch(`/admin/advertising-inquiries/${id}`, { status }); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || "Failed"); }
  };

  const updateNotes = async (id: string, notes: string) => {
    try { await api.patch(`/admin/advertising-inquiries/${id}`, { notes }); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    try { await api.delete(`/admin/advertising-inquiries/${id}`); fetchData(); }
    catch (err: any) { alert(err.response?.data?.message || "Failed"); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Advertising Inquiries</h1>

      <div className="mb-6">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500">
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No inquiries found.</p>
        ) : (
          inquiries.map((inq) => (
            <div key={inq.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{inq.businessName}</h3>
                  <p className="text-sm text-gray-400">{inq.contactPerson} • {inq.phone} {inq.email && `• ${inq.email}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={inq.status} onChange={(e) => updateStatus(inq.id, e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-red-500">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => handleDelete(inq.id)} className="text-gray-400 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-400 mb-3">
                <div>Package: {inq.package?.name || "N/A"}</div>
                <div>Budget: {inq.budgetRange || "N/A"}</div>
                <div>Start: {inq.startDate ? new Date(inq.startDate).toLocaleDateString() : "N/A"}</div>
                <div>End: {inq.endDate ? new Date(inq.endDate).toLocaleDateString() : "N/A"}</div>
              </div>
              {inq.objectives && <p className="text-gray-300 text-sm mb-3">{inq.objectives}</p>}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Admin Notes</label>
                <textarea
                  defaultValue={inq.notes || ""}
                  onBlur={(e) => updateNotes(inq.id, e.target.value)}
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none"
                  placeholder="Add notes..."
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">{new Date(inq.createdAt).toLocaleString()}</p>
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
