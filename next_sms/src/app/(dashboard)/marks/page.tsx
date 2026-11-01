import React from "react";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MarksManager from "./MarksManager";

export default async function MarksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  let userRole = "student";
  let currentUserId = 0;

  if (token) {
    const payload = await verifyJWT(token);
    if (payload && payload.userId) {
      currentUserId = payload.userId as number;
      userRole = payload.user_type as string;
    }
  }

  // Relational queries
  const classes = await prisma.my_classes.findMany({ orderBy: { id: "asc" } });
  const sections = await prisma.sections.findMany({ orderBy: { id: "asc" } });
  const subjects = await prisma.subjects.findMany({ orderBy: { id: "asc" } });
  const exams = await prisma.exams.findMany({ orderBy: { id: "desc" } });

  // For report card student list
  let studentQuery: any = { where: { grad: 0 } };

  // If user is parent, filter to their children
  if (userRole === "parent") {
    studentQuery = { where: { my_parent_id: currentUserId, grad: 0 } };
  } else if (userRole === "student") {
    studentQuery = { where: { user_id: currentUserId } };
  }

  const studentRecords = await prisma.student_records.findMany(studentQuery);
  const studentUserIds = studentRecords.map((s) => s.user_id);
  const studentUsers = await prisma.users.findMany({
    where: { id: { in: studentUserIds } },
    select: { id: true, name: true },
  });

  const studentOptions = studentRecords.map((rec) => {
    const user = studentUsers.find((u) => u.id === rec.user_id);
    return {
      id: rec.user_id,
      name: user?.name || "Student",
      adm_no: rec.adm_no,
      my_class_id: rec.my_class_id,
    };
  });

  return (
    <MarksManager
      classes={classes}
      sections={sections}
      subjects={subjects}
      exams={exams}
      students={studentOptions}
      userRole={userRole}
      currentUserId={currentUserId}
    />
  );
}
