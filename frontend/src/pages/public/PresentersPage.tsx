import { useEffect, useState } from "react";
// no icons needed
import api from "../../api/client";

export default function PresentersPage() {
  const [presenters, setPresenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/public/presenters").then((r) => {
      setPresenters(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Our Presenters</h1>
      <p className="text-gray-400 mb-8">Meet the voices behind Radio Togotane FM 88.3</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {presenters.map((p) => (
          <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-600/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                🎙️
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{p.fullName}</h2>
                <p className="text-gray-400 text-sm mt-2">{p.bio || "Presenter at Radio Togotane FM."}</p>
                {p.programs && p.programs.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Programs</p>
                    <div className="flex flex-wrap gap-2">
                      {p.programs.map((prog: any) => (
                        <span key={prog.id} className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">
                          {prog.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  {p.socialFacebook && <a href={p.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white text-sm">Facebook</a>}
                  {p.socialTwitter && <a href={p.socialTwitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white text-sm">Twitter</a>}
                  {p.socialInstagram && <a href={p.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white text-sm">Instagram</a>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
