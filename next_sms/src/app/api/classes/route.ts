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
        { error: "Permission denied. Only Administrators can manage classes." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // Action 1: Create a new class
    if (action === "create_class") {
      const { name, class_type_id } = body;
      if (!name) {
        return NextResponse.json({ error: "Class name is required." }, { status: 400 });
      }

      const existingClass = await prisma.my_classes.findFirst({
        where: { name: name.trim() },
      });
      if (existingClass) {
        return NextResponse.json(
          { error: `Class "${name}" already exists.` },
          { status: 400 }
        );
      }

      const newClass = await prisma.my_classes.create({
        data: {
          name: name.trim(),
          class_type_id: class_type_id ? parseInt(class_type_id) : null,
        },
      });

      // Automatically create a default "A" section for convenience
      await prisma.sections.create({
        data: {
          name: "A",
          my_class_id: newClass.id,
          active: 1,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Class "${name}" created with default Section A.`,
        class: newClass,
      });
    }

    // Action 2: Add a section to an existing class
    if (action === "create_section") {
      const { name, my_class_id, teacher_id } = body;
      if (!name || !my_class_id) {
        return NextResponse.json(
          { error: "Section name and target class are required." },
          { status: 400 }
        );
      }

      const existingSection = await prisma.sections.findFirst({
        where: {
          name: name.trim(),
          my_class_id: parseInt(my_class_id),
        },
      });

      if (existingSection) {
        return NextResponse.json(
          { error: `Section "${name}" already exists for this class.` },
          { status: 400 }
        );
      }

      const newSection = await prisma.sections.create({
        data: {
          name: name.trim(),
          my_class_id: parseInt(my_class_id),
          teacher_id: teacher_id ? parseInt(teacher_id) : null,
          active: 1,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Section "${name}" created successfully.`,
        section: newSection,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Classes API error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
