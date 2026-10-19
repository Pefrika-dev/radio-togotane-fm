import { useEffect, useState } from "react";
import { Radio, MapPin, Phone, Mail, Users, Heart } from "lucide-react";
import api from "../../api/client";

export default function AboutPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api.get("/public/settings").then((r) => setSettings(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">About Radio Togotane FM</h1>
      <p className="text-gray-400 mb-8">Your community radio station</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{settings?.stationName || "Radio Togotane FM"}</h2>
            <p className="text-red-400 font-medium">{settings?.frequency || "88.3 FM"}</p>
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed mb-4">
          {settings?.description || "Radio Togotane FM 88.3 is a community radio station broadcasting from Kehancha, Migori County, Kenya. We are dedicated to serving our community with quality programming, local news, music, and educational content."}
        </p>
        <p className="text-gray-300 leading-relaxed">
          Our mission is to inform, educate, and entertain our listeners while promoting community development and cultural preservation. We believe in the power of radio to connect people and give voice to the community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" /> Our Mission
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            To serve the community of Kehancha and Migori County by providing informative, educational, and entertaining radio programming that promotes community development, cultural heritage, and social cohesion.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" /> Our Vision
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            To be the leading community radio station in the region, recognized for quality broadcasting, community engagement, and positive social impact.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
        <div className="space-y-3 text-gray-400">
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-red-500" /> {settings?.address || "Kehancha, Migori County, Kenya"}</div>
          <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-red-500" /> {settings?.phone || "+254 700 000 000"}</div>
          <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-red-500" /> {settings?.email || "info@radiotogotane.co.ke"}</div>
        </div>
      </div>
    </div>
  );
}
