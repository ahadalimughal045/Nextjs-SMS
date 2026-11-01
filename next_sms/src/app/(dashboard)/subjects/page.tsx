import React from "react";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SubjectManager from "./SubjectManager";

export default async function SubjectsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  let userRole = "student";

  if (token) {
    const payload = await verifyJWT(token);
    if (payload && payload.user_type) {
      userRole = payload.user_type as string;
    }
  }

  const subjects = await prisma.subjects.findMany({ orderBy: { id: "asc" } });
  const classes = await prisma.my_classes.findMany({ orderBy: { id: "asc" } });
  const teachers = await prisma.users.findMany({
    where: { user_type: "teacher" },
    select: { id: true, name: true },
  });

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
    <SubjectManager
      initialSubjects={subjectsList}
      classes={classes}
      teachers={teachers}
      userRole={userRole}
    />
  );
}
