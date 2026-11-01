import React from "react";
import { prisma } from "@/lib/prisma";
import { Bed, Users, ShieldCheck, Home } from "lucide-react";

export default async function DormsPage() {
  const dorms = await prisma.dorms.findMany({ orderBy: { id: "asc" } });
  const studentRecords = await prisma.student_records.findMany({
    select: { dorm_id: true },
  });

  // Calculate student count per dorm
  const dormList = dorms.map((d) => {
    const studentCount = studentRecords.filter((s) => s.dorm_id === d.id).length;
    return {
      ...d,
      studentCount,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Hostels & Dormitories</h2>
          <p className="text-xs text-slate-600">
            Manage residential halls and room allocations for boarding students.
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-650 border border-blue-100">
            Total Dormitories: {dormList.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dormList.map((dorm) => (
          <div
            key={dorm.id}
            className="bg-white border border-blue-100 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm shadow-blue-500/5 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Bed size={20} />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-black truncate">{dorm.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {dorm.description || "No special description provided."}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Users size={14} className="text-blue-500" />
                <span>Enrolled Residents:</span>
              </div>
              <span className="font-bold text-blue-700 font-mono bg-blue-50 px-2.5 py-0.5 rounded-full">
                {dorm.studentCount} Students
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
