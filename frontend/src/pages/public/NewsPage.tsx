import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api/client";

export default function NewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/public/news-categories").then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "9");
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    api.get(`/public/news?${params}`).then((r) => {
      setArticles(r.data.data);
      setTotalPages(r.data.pagination?.totalPages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">News & Updates</h1>
      <p className="text-gray-400 mb-8">Latest news from Radio Togotane FM and the community</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:border-red-500"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>
      ) : articles.length === 0 ? (
        <p className="text-gray-500 text-center py-20">No articles found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link key={a.id} to={`/news/${a.slug}`} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-600/50 transition-colors">
                <div className="h-48 bg-gradient-to-br from-red-900/20 to-gray-800 flex items-center justify-center text-5xl">
                  📰
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{a.category?.name}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(a.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{a.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3">{a.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-gray-400">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
