import React from "react";
import { prisma } from "@/lib/prisma";
import { ClipboardList, Award, Calendar } from "lucide-react";

export default async function ExamsPage() {
  const exams = await prisma.exams.findMany({ orderBy: { id: "desc" } });
  const grades = await prisma.grades.findMany({ orderBy: { mark_from: "desc" } });

  return (
    <div className="space-y-10">
      {/* Exams Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-black">Exams Schedule</h2>
          <p className="text-xs text-slate-600">
            Active and past examination schedules.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((ex) => (
            <div key={ex.id} className="bg-white border border-blue-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm shadow-blue-550/5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <ClipboardList size={20} />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-black">{ex.name}</h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  <span>Year: {ex.year} • Term: {ex.term}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grades System Configuration Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-black">Grades System Scale</h2>
          <p className="text-xs text-slate-600">
            Remark guidelines and grade percentage cutoffs configured for student evaluation.
          </p>
        </div>
        <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-550/5 max-w-2xl">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs bg-blue-50/10">
                <th className="py-3 px-6">Grade Name</th>
                <th className="py-3 px-6">Mark Range</th>
                <th className="py-3 px-6">System Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-slate-800">
              {grades.map((gr) => (
                <tr key={gr.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-bold text-blue-700">{gr.name}</td>
                  <td className="py-4 px-6 text-xs text-slate-700">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded font-semibold">
                      {gr.mark_from}% - {gr.mark_to}%
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600 italic">
                    {gr.remark || "No remark"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
