import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
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
        { error: "Permission denied. Only Administrators can schedule examinations." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, term, year } = body;

    if (!name || !term || !year) {
      return NextResponse.json(
        { error: "Exam name, term (1, 2, or 3), and academic year are required." },
        { status: 400 }
      );
    }

    // Check if exam already exists for this term & year
    const existing = await prisma.exams.findFirst({
      where: {
        term: parseInt(term),
        year: year.trim(),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `An exam for Term ${term} in year ${year} already exists (${existing.name}).` },
        { status: 400 }
      );
    }

    const newExam = await prisma.exams.create({
      data: {
        name: name.trim(),
        term: parseInt(term),
        year: year.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Exam "${name}" scheduled successfully.`,
      exam: newExam,
    });
  } catch (error: any) {
    console.error("Exam creation error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
