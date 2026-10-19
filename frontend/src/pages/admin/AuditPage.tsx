import { useEffect, useState } from "react";
import api from "../../api/client";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api.get(`/admin/audit-logs?page=${page}&limit=30`).then((r) => {
      setLogs(r.data.data);
      setTotalPages(r.data.pagination?.totalPages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Audit Log</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Action</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Entity</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">IP</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-gray-800">
                <td className="px-4 py-3 text-sm font-medium">{log.action}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ""}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{log.user?.name || "System"}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{log.ipAddress || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
