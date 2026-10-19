import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, Calendar, User, Clock } from "lucide-react";
import api from "../../api/client";

export default function PodcastDetailPage() {
  const { slug } = useParams();
  const [episode, setEpisode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!slug) return;
    api.get(`/public/podcasts/${slug}`)
      .then((r) => { setEpisode(r.data.data); setLoading(false); })
      .catch(() => { setError("Episode not found"); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;
  if (error || !episode) return <div className="text-center py-20 text-gray-400">{error || "Episode not found"}</div>;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/podcasts" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Podcasts
      </Link>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-purple-900/30 to-gray-800 flex items-center justify-center text-6xl">🎧</div>
        <div className="p-8">
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{episode.category?.name}</span>
          <h1 className="text-3xl font-bold mt-3 mb-4">{episode.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            {episode.presenterName && <span className="flex items-center gap-1"><User className="w-4 h-4" /> {episode.presenterName}</span>}
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(episode.publishedAt).toLocaleDateString()}</span>
            {episode.duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, "0")}</span>}
          </div>

          {/* Audio Player */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center">
                {playing ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">{episode.title}</p>
                <audio ref={audioRef} src={episode.audioUrl} onEnded={() => setPlaying(false)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            {episode.description?.split("\n").map((para: string, i: number) => (
              <p key={i} className="text-gray-300 leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
