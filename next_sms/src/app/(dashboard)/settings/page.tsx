import React from "react";
import { prisma } from "@/lib/prisma";
import { Settings, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default async function SettingsPage() {
  const settingsList = await prisma.settings.findMany();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-black">Global System Settings</h2>
        <p className="text-xs text-slate-600">
          Global variables, current sessions, fee structures, and metadata settings.
        </p>
      </div>

      {/* Settings Grid Panel */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-550/5">
        <div className="p-6 md:p-8 space-y-6 divide-y divide-slate-100">
          {settingsList.map((set, idx) => (
            <div key={set.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${idx > 0 ? "pt-5" : ""}`}>
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-750 uppercase tracking-wide font-mono">
                  {set.type.replace(/_/g, " ")}
                </span>
              </div>
              <div className="w-full sm:w-2/3">
                <input
                  type="text"
                  value={set.description || ""}
                  readOnly
                  disabled
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
