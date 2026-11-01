import React from "react";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentManager from "./StudentManager";

export default async function StudentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  let userRole = "student";

  if (token) {
    const payload = await verifyJWT(token);
    if (payload && payload.user_type) {
      userRole = payload.user_type as string;
    }
  }

  // Query records and relational lookups
  const studentRecords = await prisma.student_records.findMany({
    orderBy: { id: "desc" },
  });
  const users = await prisma.users.findMany({ where: { user_type: "student" } });
  const parents = await prisma.users.findMany({
    where: { user_type: "parent" },
    select: { id: true, name: true, phone: true, email: true },
  });
  const classes = await prisma.my_classes.findMany({ orderBy: { id: "asc" } });
  const sections = await prisma.sections.findMany({ orderBy: { id: "asc" } });
  const dorms = await prisma.dorms.findMany({ orderBy: { id: "asc" } });
  const bloodGroups = await prisma.blood_groups.findMany({ orderBy: { id: "asc" } });

  // Get current session setting
  const sessionSetting = await prisma.settings.findFirst({
    where: { type: "current_session" },
  });
  const currentSession = sessionSetting?.description || "2026-2027";

  // Combine student details in memory
  const studentsList = studentRecords
    .map((rec) => {
      const user = users.find((u) => u.id === rec.user_id);
      const myClass = classes.find((c) => c.id === rec.my_class_id);
      const section = sections.find((s) => s.id === rec.section_id);
      const parent = parents.find((p) => p.id === rec.my_parent_id);
      const dorm = dorms.find((d) => d.id === rec.dorm_id);
      const bloodGroup = bloodGroups.find((bg) => bg.id === user?.bg_id);

      return {
        ...rec,
        user,
        myClass,
        section,
        parent,
        dorm,
        bloodGroup,
      };
    })
    .filter((item) => item.user !== undefined);

  return (
    <StudentManager
      initialStudents={studentsList}
      classes={classes}
      sections={sections}
      dorms={dorms}
      parents={parents}
      bloodGroups={bloodGroups}
      currentSession={currentSession}
      userRole={userRole}
    />
  );
}
