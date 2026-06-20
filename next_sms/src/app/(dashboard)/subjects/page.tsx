import React from "react";
import { prisma } from "@/lib/prisma";
import { BookOpen, User, School } from "lucide-react";

export default async function SubjectsPage() {
  const subjects = await prisma.subjects.findMany();
  const classes = await prisma.my_classes.findMany();
  const teachers = await prisma.users.findMany({ where: { user_type: "teacher" } });

  const subjectsList = subjects.map((sub) => {
    const myClass = classes.find((c) => c.id === sub.my_class_id);
    const teacher = teachers.find((t) => t.id === sub.teacher_id);
    return {
      ...sub,
      myClass,
      teacher,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Subjects Registry</h2>
          <p className="text-xs text-slate-600">
            List of curriculum subjects, assigned classes, and instructors.
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-650 border border-blue-100">
            Total Subjects: {subjectsList.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectsList.map((sub) => (
          <div key={sub.id} className="bg-white border border-blue-100 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm shadow-blue-550/5 hover:border-blue-300 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <BookOpen size={20} />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-black truncate">{sub.name}</h3>
                <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-800 uppercase font-mono">
                  Slug: {sub.slug}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <School size={14} className="text-slate-400" />
                <span>Class: <strong className="text-slate-800">{sub.myClass?.name || "N/A"}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span>Teacher: <strong className="text-slate-800">{sub.teacher?.name || "No Instructor"}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
