import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft } from "lucide-react";
import api from "../../api/client";

export default function NewsDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    api.get(`/public/news/${slug}`)
      .then((r) => { setArticle(r.data.data); setLoading(false); })
      .catch(() => { setError("Article not found"); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;
  if (error || !article) return <div className="text-center py-20 text-gray-400">{error || "Article not found"}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/news" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to News
      </Link>

      <article>
        <div className="mb-6">
          <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">{article.category?.name}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          {article.authorName && <span className="flex items-center gap-1"><User className="w-4 h-4" /> {article.authorName}</span>}
        </div>

        {article.featuredImageUrl && (
          <img src={article.featuredImageUrl} alt={article.title} className="w-full rounded-xl mb-8" />
        )}

        <div className="prose prose-invert max-w-none">
          {article.content.split("\n").map((para: string, i: number) => (
            <p key={i} className="text-gray-300 leading-relaxed mb-4">{para}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
