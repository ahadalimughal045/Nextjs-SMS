import React from "react";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PaymentManager from "./PaymentManager";

export default async function PaymentsPage() {
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

  // Query fee structures
  const feeStructures = await prisma.payments.findMany({
    orderBy: { id: "desc" },
  });

  const classes = await prisma.my_classes.findMany({ orderBy: { id: "asc" } });

  // Query student records & users for student lookup
  const studentRecords = await prisma.student_records.findMany({
    where: { grad: 0 },
  });
  const studentUserIds = studentRecords.map((s) => s.user_id);
  const studentUsers = await prisma.users.findMany({
    where: { id: { in: studentUserIds } },
    select: { id: true, name: true },
  });

  const studentOptions = studentRecords.map((rec) => {
    const user = studentUsers.find((u) => u.id === rec.user_id);
    const myClass = classes.find((c) => c.id === rec.my_class_id);
    return {
      id: rec.user_id,
      name: user?.name || "Student",
      adm_no: rec.adm_no,
      className: myClass?.name || "Class",
    };
  });

  // Query payment records based on role
  let recordQuery: any = { take: 50, orderBy: { id: "desc" } };
  if (userRole === "student") {
    recordQuery = { where: { student_id: currentUserId }, orderBy: { id: "desc" } };
  } else if (userRole === "parent") {
    const childrenIds = studentRecords
      .filter((s) => s.my_parent_id === currentUserId)
      .map((s) => s.user_id);
    recordQuery = { where: { student_id: { in: childrenIds } }, orderBy: { id: "desc" } };
  }

  const paymentRecordsRaw = await prisma.payment_records.findMany(recordQuery);

  // Join payment record lookups
  const paymentRecords = paymentRecordsRaw.map((rec) => {
    const student = studentOptions.find((s) => s.id === rec.student_id);
    const fee = feeStructures.find((f) => f.id === rec.payment_id);
    return {
      ...rec,
      student,
      fee,
    };
  });

  // Fee structures with class name
  const feeStructuresWithClass = feeStructures.map((f) => {
    const myClass = classes.find((c) => c.id === f.my_class_id);
    return {
      ...f,
      myClass,
    };
  });

  const sessionSetting = await prisma.settings.findFirst({
    where: { type: "current_session" },
  });
  const currentSession = sessionSetting?.description || "2026-2027";

  return (
    <PaymentManager
      feeStructures={feeStructuresWithClass}
      paymentRecords={paymentRecords}
      students={studentOptions}
      classes={classes}
      currentSession={currentSession}
      userRole={userRole}
    />
  );
}
