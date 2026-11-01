import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Random 4-character block generator
function randomBlock(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
        { error: "Permission denied. Only Administrators can generate scratch card PINs." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const count = Math.min(100, Math.max(1, parseInt(body.count) || 10));

    const generatedCodes: string[] = [];
    for (let i = 0; i < count; i++) {
      const pinCode = `CJ-${randomBlock()}-${randomBlock()}-${randomBlock()}`;
      generatedCodes.push(pinCode);
    }

    // Insert batch into pins table
    await prisma.$transaction(
      generatedCodes.map((code) =>
        prisma.pins.create({
          data: {
            code,
            used: "0",
            times_used: "0",
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${count} new Scratch Card PINs.`,
      count,
    });
  } catch (error: any) {
    console.error("PIN generation error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
