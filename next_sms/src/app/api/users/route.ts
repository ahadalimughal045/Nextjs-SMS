import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (payload.user_type !== "super_admin" && payload.user_type !== "admin") {
      return NextResponse.json(
        { error: "Permission denied. Only Administrators can register new accounts." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, username, user_type, phone, password } = body;

    if (!name || !user_type) {
      return NextResponse.json(
        { error: "Name and User Role are required." },
        { status: 400 }
      );
    }

    // Disallow regular admins from creating super_admins
    if (user_type === "super_admin" && payload.user_type !== "super_admin") {
      return NextResponse.json(
        { error: "Only Super Administrators can create other Super Administrators." },
        { status: 403 }
      );
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedUsername =
      username?.trim() ||
      name.toLowerCase().replace(/[^a-z0-9]/g, "") + randomSuffix;

    const userCode = `${user_type.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}-${randomSuffix}`;

    // Check duplicate username or email
    const existing = await prisma.users.findFirst({
      where: {
        OR: [
          { username: generatedUsername },
          ...(email ? [{ email: email.trim() }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username or email is already taken." },
        { status: 400 }
      );
    }

    const rawPassword = password || "cj123";
    const hashedPassword = await hashPassword(rawPassword);

    const newUser = await prisma.users.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        username: generatedUsername,
        user_type,
        code: userCode,
        phone: phone?.trim() || null,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${name} successfully registered with role: ${user_type.replace("_", " ")}.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        user_type: newUser.user_type,
      },
    });
  } catch (error: any) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
