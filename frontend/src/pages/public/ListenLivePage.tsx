import { useEffect, useState, useRef } from "react";
import { Radio, Play, Pause, Volume2, VolumeX, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import api from "../../api/client";

export default function ListenLivePage() {
  const [settings, setSettings] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    api.get("/public/settings").then((r) => setSettings(r.data.data)).catch(() => {});
  }, []);

  const streamUrl = settings?.streamUrl;
  const streamType = settings?.streamType || "external";

  const togglePlay = () => {
    if (!audioRef.current || !streamUrl) {
      setError("Stream URL not configured. Please contact the station.");
      return;
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      setError(null);
      audioRef.current.play()
        .then(() => { setPlaying(true); setLoading(false); })
        .catch(() => {
          setError("Unable to connect to stream. The stream may be unavailable.");
          setLoading(false);
          setPlaying(false);
        });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (audioRef.current) audioRef.current.muted = !muted;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Listen Live</h1>
        <p className="text-gray-400 text-lg">Radio Togotane FM {settings?.frequency || "88.3 FM"}</p>
      </div>

      {/* Player Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12">
        <div className="flex flex-col items-center">
          {/* Station Logo / Animation */}
          <div className={`w-32 h-32 rounded-full bg-red-600/20 flex items-center justify-center mb-8 ${playing ? "animate-pulse" : ""}`}>
            <Radio className="w-16 h-16 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2">{settings?.stationName || "Radio Togotane FM"}</h2>
          <p className="text-gray-400 mb-8">{settings?.tagline || "Voice of the Community"}</p>

          {/* Status */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 w-full max-w-md">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={!streamUrl}
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors mb-8"
          >
            {loading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : playing ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-4 w-full max-w-md">
            <button onClick={toggleMute} className="text-gray-400 hover:text-white">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 accent-red-500"
            />
            <span className="text-sm text-gray-500 w-10 text-right">{Math.round(volume * 100)}%</span>
          </div>

          {/* Stream Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            {streamUrl ? (
              <p>
                {streamType === "external" ? (
                  <span className="flex items-center gap-1 justify-center">
                    <ExternalLink className="w-3 h-3" /> Using externally hosted stream
                  </span>
                ) : (
                  "Direct stream"
                )}
              </p>
            ) : (
              <p className="text-yellow-500">
                Stream not configured. The station administrator needs to set up the stream URL in the admin dashboard.
              </p>
            )}
          </div>
        </div>

        {/* Hidden audio element */}
        {streamUrl && (
          <audio
            ref={audioRef}
            src={streamUrl}
            preload="none"
            onError={() => {
              setError("Stream connection failed. Please try again later.");
              setPlaying(false);
              setLoading(false);
            }}
            onWaiting={() => setLoading(true)}
            onPlaying={() => { setLoading(false); setPlaying(true); }}
            onEnded={() => setPlaying(false)}
          />
        )}
      </div>

      {/* Info Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-3">How to Listen</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>• Tune your radio to 88.3 FM (within broadcast range)</li>
            <li>• Stream online using the player above</li>
            <li>• Use the WhatsApp button to request songs</li>
          </ul>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Stream Quality</h3>
          <p className="text-gray-400 text-sm">
            Our online stream provides high-quality audio. If you experience buffering, try reducing other network usage or check your internet connection.
          </p>
        </div>
      </div>
    </div>
  );
}
