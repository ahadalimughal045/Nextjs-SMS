import React from "react";
import { prisma } from "@/lib/prisma";
import { Trophy, Calendar } from "lucide-react";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";

export default async function MarksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  let whereClause: any = {};

  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      if (payload.user_type === "student") {
        whereClause = { student_id: payload.userId as number };
      } else if (payload.user_type === "parent") {
        const children = await prisma.student_records.findMany({
          where: { my_parent_id: payload.userId as number },
          select: { user_id: true },
        });
        const childrenIds = children.map((c) => c.user_id);
        whereClause = { student_id: { in: childrenIds } };
      }
    }
  }

  const marks = await prisma.marks.findMany({
    where: whereClause,
    take: 30,
    orderBy: { id: "desc" },
  });
  const users = await prisma.users.findMany({ where: { user_type: "student" } });
  const subjects = await prisma.subjects.findMany();
  const exams = await prisma.exams.findMany();

  const marksList = marks.map((mk) => {
    const student = users.find((u) => u.id === mk.student_id);
    const subject = subjects.find((s) => s.id === mk.subject_id);
    const exam = exams.find((e) => e.id === mk.exam_id);
    return {
      ...mk,
      student,
      subject,
      exam,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-black">Academic Marks Sheets</h2>
        <p className="text-xs text-slate-600">
          Showing recently updated continuous assessment (CA) scores and examination marks.
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-550/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs bg-blue-50/10">
                <th className="py-3 px-6">Student</th>
                <th className="py-3 px-6">Subject</th>
                <th className="py-3 px-6">Exam Reference</th>
                <th className="py-3 px-6">CA (T1-T4)</th>
                <th className="py-3 px-6">Exam Score</th>
                <th className="py-3 px-6">Total / Cumulative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-slate-800">
              {marksList.map((mk) => (
                <tr key={mk.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-black">
                    {mk.student?.name || `Student ID: ${mk.student_id}`}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-700">
                    <span className="font-semibold">{mk.subject?.name || `Subject ID: ${mk.subject_id}`}</span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-650">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      {mk.exam?.name || `Exam ID: ${mk.exam_id}`} ({mk.year})
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-650 font-mono">
                    {mk.t1 ?? 0} + {mk.t2 ?? 0} + {mk.t3 ?? 0} + {mk.t4 ?? 0}
                  </td>
                  <td className="py-4 px-6 text-xs font-bold text-blue-700 font-mono">
                    {mk.exm ?? 0}
                  </td>
                  <td className="py-4 px-6 text-xs font-bold text-slate-850">
                    <span className="inline-flex items-center gap-1">
                      <Trophy size={12} className="text-amber-500" />
                      {mk.cum ?? (mk.t1 || 0) + (mk.t2 || 0) + (mk.t3 || 0) + (mk.t4 || 0) + (mk.exm || 0)}
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
