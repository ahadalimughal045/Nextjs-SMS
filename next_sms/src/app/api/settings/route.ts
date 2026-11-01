import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
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

    // Only super_admin or admin can modify global settings
    if (payload.user_type !== "super_admin" && payload.user_type !== "admin") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body; // Array of { id, description }

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    // Update settings in transaction
    await prisma.$transaction(
      settings.map((item: { id: number; description: string }) =>
        prisma.settings.update({
          where: { id: item.id },
          data: { description: item.description },
        })
      )
    );

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
