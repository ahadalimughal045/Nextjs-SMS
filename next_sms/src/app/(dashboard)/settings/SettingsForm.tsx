"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface SettingItem {
  id: number;
  type: string;
  description: string | null;
}

export default function SettingsForm({ initialSettings }: { initialSettings: SettingItem[] }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (id: number, val: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, description: val } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: settings.map((s) => ({
            id: s.id,
            description: s.description || "",
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Settings saved successfully!");
        router.refresh();
      } else {
        setError(data.error || "Failed to update settings");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-500/5 divide-y divide-slate-100 p-6 md:p-8 space-y-5">
        {settings.map((set, idx) => (
          <div
            key={set.id}
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
              idx > 0 ? "pt-5" : ""
            }`}
          >
            <div className="space-y-1 sm:w-1/3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono block">
                {set.type.replace(/_/g, " ")}
              </label>
            </div>
            <div className="w-full sm:w-2/3">
              <input
                type="text"
                value={set.description || ""}
                onChange={(e) => handleChange(set.id, e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-slate-800 outline-none transition-all"
                placeholder={`Enter ${set.type.replace(/_/g, " ")}`}
              />
            </div>
          </div>
        ))}

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
