import React from "react";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const settingsList = await prisma.settings.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-black">Global System Settings</h2>
        <p className="text-xs text-slate-600">
          Manage system configurations, school name, current academic session, and term dates.
        </p>
      </div>

      {/* Interactive Settings Form */}
      <SettingsForm initialSettings={settingsList} />
    </div>
  );
}
