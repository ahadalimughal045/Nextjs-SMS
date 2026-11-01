import React from "react";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExamManager from "./ExamManager";

export default async function ExamsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  let userRole = "student";

  if (token) {
    const payload = await verifyJWT(token);
    if (payload && payload.user_type) {
      userRole = payload.user_type as string;
    }
  }

  const exams = await prisma.exams.findMany({ orderBy: { id: "desc" } });
  const grades = await prisma.grades.findMany({ orderBy: { mark_from: "desc" } });

  const sessionSetting = await prisma.settings.findFirst({
    where: { type: "current_session" },
  });
  const currentSession = sessionSetting?.description || "2026-2027";

  return (
    <ExamManager
      initialExams={exams}
      grades={grades}
      currentSession={currentSession}
      userRole={userRole}
    />
  );
}
