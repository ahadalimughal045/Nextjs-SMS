import React from "react";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PinManager from "./PinManager";

export default async function PinsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  let userRole = "student";

  if (token) {
    const payload = await verifyJWT(token);
    if (payload && payload.user_type) {
      userRole = payload.user_type as string;
    }
  }

  const pins = await prisma.pins.findMany({
    take: 100,
    orderBy: { id: "desc" },
  });
  const users = await prisma.users.findMany({
    select: { id: true, name: true },
  });

  const pinsList = pins.map((p) => {
    const studentUser = users.find((u) => u.id === p.student_id);
    return {
      ...p,
      studentUser,
    };
  });

  return <PinManager initialPins={pinsList} userRole={userRole} />;
}
