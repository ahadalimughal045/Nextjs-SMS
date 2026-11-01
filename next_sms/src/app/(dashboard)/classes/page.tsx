import React from "react";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClassManager from "./ClassManager";

export default async function ClassesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  let userRole = "student";

  if (token) {
    const payload = await verifyJWT(token);
    if (payload && payload.user_type) {
      userRole = payload.user_type as string;
    }
  }

  // Query records
  const classes = await prisma.my_classes.findMany({ orderBy: { id: "asc" } });
  const classTypes = await prisma.class_types.findMany({ orderBy: { id: "asc" } });
  const sections = await prisma.sections.findMany({ orderBy: { id: "asc" } });
  const teachers = await prisma.users.findMany({
    where: { user_type: "teacher" },
    select: { id: true, name: true },
  });
  const studentRecords = await prisma.student_records.findMany({
    select: { my_class_id: true },
  });

  // Prepare classes with sections and student count
  const classesList = classes.map((cls) => {
    const type = classTypes.find((t) => t.id === cls.class_type_id);
    const clsSections = sections
      .filter((s) => s.my_class_id === cls.id)
      .map((s) => {
        const teacher = teachers.find((t) => t.id === s.teacher_id);
        return {
          ...s,
          teacher,
        };
      });

    const studentCount = studentRecords.filter((st) => st.my_class_id === cls.id).length;

    return {
      ...cls,
      type,
      sections: clsSections,
      studentCount,
    };
  });

  return (
    <ClassManager
      initialClasses={classesList}
      classTypes={classTypes}
      teachers={teachers}
      userRole={userRole}
    />
  );
}
