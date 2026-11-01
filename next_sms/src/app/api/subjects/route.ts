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
        { error: "Permission denied. Only Administrators can add curriculum subjects." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, my_class_id, teacher_id, slug } = body;

    if (!name || !my_class_id) {
      return NextResponse.json(
        { error: "Subject name and target class are required." },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

    const existingSubject = await prisma.subjects.findFirst({
      where: {
        my_class_id: parseInt(my_class_id),
        name: name.trim(),
      },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: `Subject "${name}" already exists for this class.` },
        { status: 400 }
      );
    }

    const newSubject = await prisma.subjects.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        my_class_id: parseInt(my_class_id),
        teacher_id: teacher_id ? parseInt(teacher_id) : 1, // Fallback to primary admin if not selected
      },
    });

    return NextResponse.json({
      success: true,
      message: `Subject "${name}" added to curriculum successfully.`,
      subject: newSubject,
    });
  } catch (error: any) {
    console.error("Subject creation error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
