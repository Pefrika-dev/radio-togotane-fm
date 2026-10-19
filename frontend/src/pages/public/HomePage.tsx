import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, Play, Calendar, Users, Newspaper, Mic } from "lucide-react";
import api from "../../api/client";

export default function HomePage() {
  const [settings, setSettings] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [presenters, setPresenters] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    api.get("/public/settings").then((r) => setSettings(r.data.data)).catch(() => {});
    api.get("/public/programs").then((r) => setPrograms(r.data.data)).catch(() => {});
    api.get("/public/presenters").then((r) => setPresenters(r.data.data)).catch(() => {});
    api.get("/public/news?limit=3").then((r) => setArticles(r.data.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-red-950/30 to-gray-900 py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Radio className="w-4 h-4" /> {settings?.frequency || "88.3 FM"} - Live Now
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Radio Togotane FM
          </h1>
          <p className="text-xl text-gray-300 mb-4">{settings?.tagline || "Voice of the Community"}</p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            {settings?.description || "Broadcasting from Kehancha, Migori County, Kenya. Your community radio station."}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/listen" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 transition-colors">
              <Play className="w-5 h-5" /> Listen Live
            </Link>
            <Link to="/programs" className="border border-gray-600 hover:border-gray-400 text-white px-8 py-3 rounded-full font-medium transition-colors">
              View Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* Now Playing / Stream CTA */}
      <section className="bg-red-600 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">On Air Now</p>
              <p className="text-red-100 text-sm">Tune in to 88.3 FM or stream online</p>
            </div>
          </div>
          <Link to="/listen" className="bg-white text-red-600 px-6 py-2 rounded-full font-medium hover:bg-red-50 transition-colors">
            Start Listening
          </Link>
        </div>
      </section>

      {/* Today's Schedule */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-7 h-7 text-red-500" /> Today's Programs
          </h2>
          <Link to="/programs" className="text-red-400 hover:text-red-300 text-sm font-medium">View Full Schedule →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.slice(0, 6).map((p) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-red-600/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">{p.category}</span>
                <span className="text-xs text-gray-500">{p.schedules?.[0]?.startTime} - {p.schedules?.[0]?.endTime}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mic className="w-4 h-4" />
                {p.presenter?.fullName || "TBA"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Presenters */}
      <section className="bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7 text-red-500" /> Our Presenters
            </h2>
            <Link to="/presenters" className="text-red-400 hover:text-red-300 text-sm font-medium">Meet All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {presenters.map((p) => (
              <Link key={p.id} to="/presenters" className="text-center group">
                <div className="w-24 h-24 mx-auto mb-3 bg-gray-800 rounded-full flex items-center justify-center text-3xl group-hover:ring-2 ring-red-500 transition-all">
                  🎙️
                </div>
                <h3 className="font-semibold">{p.fullName}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{p.bio}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-red-500" /> Latest News
          </h2>
          <Link to="/news" className="text-red-400 hover:text-red-300 text-sm font-medium">Read All →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link key={a.id} to={`/news/${a.slug}`} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-600/50 transition-colors">
              <div className="h-40 bg-gradient-to-br from-red-900/30 to-gray-800 flex items-center justify-center text-4xl">📰</div>
              <div className="p-5">
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{a.category?.name}</span>
                <h3 className="font-semibold text-lg mt-2 mb-2 line-clamp-2">{a.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-3">{a.excerpt}</p>
                <p className="text-gray-500 text-xs mt-3">{new Date(a.publishedAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
