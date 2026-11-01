import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, GraduationCap, School, BookOpen, Trophy, Calendar, AlertCircle } from "lucide-react";

export default async function MyChildrenPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyJWT(token);
  if (!payload || !payload.userId) {
    redirect("/login");
  }

  const parentId = payload.userId as number;

  // Find all children linked to this parent
  const studentRecords = await prisma.student_records.findMany({
    where: { my_parent_id: parentId },
  });

  const studentUserIds = studentRecords.map((s) => s.user_id);
  const studentUsers = await prisma.users.findMany({
    where: { id: { in: studentUserIds } },
  });
  const classes = await prisma.my_classes.findMany();
  const sections = await prisma.sections.findMany();

  // Combine student details
  const childrenList = studentRecords.map((rec) => {
    const user = studentUsers.find((u) => u.id === rec.user_id);
    const myClass = classes.find((c) => c.id === rec.my_class_id);
    const section = sections.find((s) => s.id === rec.section_id);
    return {
      ...rec,
      user,
      myClass,
      section,
    };
  }).filter((c) => c.user !== undefined);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-black">My Children</h2>
        <p className="text-sm text-slate-600">
          View academic profiles, classes, and performance reports for your registered children.
        </p>
      </div>

      {childrenList.length === 0 ? (
        <div className="bg-white border border-blue-100 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Children Linked Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No student profile is currently linked to your parent account. Please contact the school administrative office with your student&apos;s admission number.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {childrenList.map((child) => (
            <div
              key={child.id}
              className="bg-white border border-blue-100 rounded-2xl p-6 space-y-5 shadow-sm shadow-blue-500/5 hover:border-blue-300 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  {child.user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-black truncate">{child.user?.name}</h3>
                  <p className="text-xs text-blue-650 font-mono font-semibold">
                    Adm No: {child.adm_no || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/60">
                  <span className="text-slate-500 block text-[11px]">Class & Section</span>
                  <span className="font-bold text-slate-800">
                    {child.myClass?.name || "N/A"} {child.section ? `(${child.section.name})` : ""}
                  </span>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/60">
                  <span className="text-slate-500 block text-[11px]">Session</span>
                  <span className="font-bold text-slate-800">{child.session || "Current"}</span>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/60">
                  <span className="text-slate-500 block text-[11px]">Status</span>
                  <span className={`inline-flex font-semibold ${child.grad === 1 ? "text-emerald-700" : "text-blue-700"}`}>
                    {child.grad === 1 ? "Graduated" : "Active Student"}
                  </span>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/60">
                  <span className="text-slate-500 block text-[11px]">Dorm Room</span>
                  <span className="font-bold text-slate-800">{child.dorm_room_no || "Day Student"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href="/marks"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold text-center transition-colors shadow-sm"
                >
                  View Terminal Marks
                </a>
                <a
                  href="/payments"
                  className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold text-center transition-colors"
                >
                  Fee Statement
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
