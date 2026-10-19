import { useEffect, useState } from "react";
import { Mic, Radio } from "lucide-react";
import api from "../../api/client";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/public/programs"),
      api.get("/public/schedule"),
    ]).then(([p, s]) => {
      setPrograms(p.data.data);
      setSchedules(s.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const daySchedules = schedules
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Programs & Schedule</h1>
      <p className="text-gray-400 mb-8">Weekly broadcast schedule (Africa/Nairobi time)</p>

      {/* Day selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {DAYS.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(i)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedDay === i ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule for selected day */}
      <div className="space-y-4 mb-12">
        {daySchedules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No programs scheduled for this day.</p>
        ) : (
          daySchedules.map((s) => (
            <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-red-600/50 transition-colors">
              <div className="md:w-32 flex-shrink-0">
                <div className="text-red-400 font-semibold text-lg">{s.startTime}</div>
                <div className="text-gray-500 text-sm">{s.endTime}</div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{s.program?.name}</h3>
                <p className="text-gray-400 text-sm">{s.program?.description}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Mic className="w-4 h-4" />
                  {s.program?.presenter?.fullName || "TBA"}
                  <span className="mx-2">•</span>
                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{s.program?.category}</span>
                </div>
              </div>
              {s.isSpecial && (
                <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">Special</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* All Programs */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Radio className="w-6 h-6 text-red-500" /> All Programs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((p) => (
          <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">{p.category}</span>
              <span className={`text-xs px-2 py-1 rounded ${p.status === "ACTIVE" ? "bg-green-600/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>{p.status}</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{p.description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mic className="w-4 h-4" />
              {p.presenter?.fullName || "TBA"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
