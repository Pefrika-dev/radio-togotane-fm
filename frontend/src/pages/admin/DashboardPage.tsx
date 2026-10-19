import { useEffect, useState } from "react";
import { Newspaper, Users, Radio, Podcast, Mail, Megaphone, TrendingUp } from "lucide-react";
import api from "../../api/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => {
      setStats(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  const statCards = [
    { label: "Total Articles", value: stats?.stats?.totalArticles || 0, icon: Newspaper, color: "text-blue-400" },
    { label: "Published", value: stats?.stats?.publishedArticles || 0, icon: TrendingUp, color: "text-green-400" },
    { label: "Drafts", value: stats?.stats?.draftArticles || 0, icon: Newspaper, color: "text-yellow-400" },
    { label: "Presenters", value: stats?.stats?.totalPresenters || 0, icon: Users, color: "text-purple-400" },
    { label: "Active Programs", value: stats?.stats?.activePrograms || 0, icon: Radio, color: "text-red-400" },
    { label: "Podcast Episodes", value: stats?.stats?.totalEpisodes || 0, icon: Podcast, color: "text-pink-400" },
    { label: "Unread Messages", value: stats?.stats?.unreadMessages || 0, icon: Mail, color: "text-orange-400" },
    { label: "New Inquiries", value: stats?.stats?.newInquiries || 0, icon: Megaphone, color: "text-cyan-400" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">{card.label}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        {stats?.recentActivity?.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {stats?.recentActivity?.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <span className="text-sm font-medium">{log.action}</span>
                  <span className="text-gray-500 text-sm ml-2">{log.entityType}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {log.user?.name || "System"} • {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
