import React from "react";
import { prisma } from "@/lib/prisma";
import { GraduationCap, Award, Calendar, Layers, ShieldCheck } from "lucide-react";

export default async function StudentsPage() {
  // Query tables
  const studentRecords = await prisma.student_records.findMany();
  const users = await prisma.users.findMany({ where: { user_type: "student" } });
  const classes = await prisma.my_classes.findMany();
  const sections = await prisma.sections.findMany();

  // Join in memory
  const studentsList = studentRecords
    .map((rec) => {
      const user = users.find((u) => u.id === rec.user_id);
      const myClass = classes.find((c) => c.id === rec.my_class_id);
      const section = sections.find((s) => s.id === rec.section_id);
      return {
        ...rec,
        user,
        myClass,
        section,
      };
    })
    .filter((item) => item.user !== undefined);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Students Directory</h2>
          <p className="text-xs text-slate-600">
            View admission numbers, assigned classes, sessions, and graduation status.
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-650 border border-blue-100">
            Total Students: {studentsList.length}
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-550/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs bg-blue-50/10">
                <th className="py-3 px-6">Student Name</th>
                <th className="py-3 px-6">Admission No</th>
                <th className="py-3 px-6">Class & Section</th>
                <th className="py-3 px-6">Active Session</th>
                <th className="py-3 px-6">Graduation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-slate-800">
              {studentsList.map((st) => (
                <tr key={st.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-black">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                        {st.user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span>{st.user?.name}</span>
                        <span className="block text-[10px] text-slate-450 font-normal mt-0.5">
                          Age: {st.age || "—"} • Year Admitted: {st.year_admitted || "—"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-blue-650 font-semibold">
                    {st.adm_no || "—"}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded">
                        {st.myClass?.name || "No Class"}
                      </span>
                      {st.section && (
                        <span className="text-slate-400">
                          (Sec: {st.section.name})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-650">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-450" />
                      {st.session}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${
                      st.grad === 1
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-50 text-blue-850"
                    }`}>
                      {st.grad === 1 ? "Graduated" : "Active Student"}
                    </span>
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
