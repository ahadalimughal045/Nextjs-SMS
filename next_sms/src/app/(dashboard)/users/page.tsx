import React from "react";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserManager from "./UserManager";

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  let userRole = "student";

  if (token) {
    const payload = await verifyJWT(token);
    if (payload && payload.user_type) {
      userRole = payload.user_type as string;
    }
  }

  const usersList = await prisma.users.findMany({
    orderBy: { id: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      user_type: true,
      photo: true,
    },
  });

  return <UserManager initialUsers={usersList} userRole={userRole} />;
}
