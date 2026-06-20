import React from "react";
import { prisma } from "@/lib/prisma";
import { Calendar, School, Clock } from "lucide-react";

export default async function TimetablesPage() {
  const records = await prisma.time_table_records.findMany();
  const classes = await prisma.my_classes.findMany();

  const timetablesList = records.map((rec) => {
    const myClass = classes.find((c) => c.id === rec.my_class_id);
    return {
      ...rec,
      myClass,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-black">Academic Timetables</h2>
        <p className="text-xs text-slate-600">
          Timetables configured for classes, lectures, and exams.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timetablesList.map((rec) => (
          <div key={rec.id} className="bg-white border border-blue-100 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm shadow-blue-550/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Calendar size={20} />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-black truncate">{rec.name}</h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" />
                  <span>Session Year: {rec.year}</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
              <School size={14} className="text-slate-400" />
              <span>Assigned Class: <strong className="text-slate-800">{rec.myClass?.name || "N/A"}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
