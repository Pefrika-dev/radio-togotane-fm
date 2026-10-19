import { useEffect, useState } from "react";
import { Megaphone, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../api/client";

export default function AdvertisePage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [form, setForm] = useState({
    businessName: "", contactPerson: "", phone: "", email: "",
    packageId: "", objectives: "", budgetRange: "", startDate: "", endDate: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    api.get("/public/advertising-packages").then((r) => setPackages(r.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await api.post("/public/advertising-inquiry", form);
      setStatus("success");
      setForm({ businessName: "", contactPerson: "", phone: "", email: "", packageId: "", objectives: "", budgetRange: "", startDate: "", endDate: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Failed to submit inquiry. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Advertise With Us</h1>
      <p className="text-gray-400 mb-8">Reach your audience through Radio Togotane FM 88.3</p>

      {/* Packages */}
      {packages.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Advertising Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-600/50 transition-colors">
                <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                <p className="text-red-400 font-medium text-sm mb-3">{pkg.price || "Contact for pricing"}</p>
                {pkg.features && (
                  <ul className="text-gray-500 text-sm space-y-1">
                    {JSON.parse(pkg.features).map((f: string, i: number) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inquiry Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-red-500" /> Advertising Inquiry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Business Name *</label>
              <input type="text" required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Contact Person *</label>
              <input type="text" required value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone *</label>
              <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Preferred Package</label>
            <select value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500">
              <option value="">Select a package</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Campaign Objectives</label>
            <textarea rows={3} value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Budget Range</label>
              <input type="text" value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })} placeholder="e.g. KES 10,000 - 50,000" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Preferred Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500" />
            </div>
          </div>

          {status === "success" && (
            <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Inquiry submitted successfully! We'll contact you soon.
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {errorMsg}
            </div>
          )}

          <button type="submit" disabled={status === "loading"} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            {status === "loading" ? "Submitting..." : "Submit Inquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
