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

    // Only super_admin or admin can admit students
    if (payload.user_type !== "super_admin" && payload.user_type !== "admin") {
      return NextResponse.json(
        { error: "Permission denied. Only Administrators can admit students." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      username,
      gender,
      dob,
      phone,
      address,
      bg_id,
      my_class_id,
      section_id,
      adm_no,
      my_parent_id,
      dorm_id,
      dorm_room_no,
      session,
      age,
      year_admitted,
      password,
    } = body;

    if (!name || !my_class_id || !section_id) {
      return NextResponse.json(
        { error: "Student name, class, and section are required." },
        { status: 400 }
      );
    }

    // Check if admission number already exists
    if (adm_no) {
      const existingAdm = await prisma.student_records.findFirst({
        where: { adm_no },
      });
      if (existingAdm) {
        return NextResponse.json(
          { error: `Admission number ${adm_no} is already registered.` },
          { status: 400 }
        );
      }
    }

    // Auto-generate code and admission number if not provided
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const studentCode = `STD-${Date.now().toString().slice(-4)}-${randomSuffix}`;
    const generatedAdmNo = adm_no || `CJ/${new Date().getFullYear()}/${randomSuffix}`;
    const generatedUsername =
      username?.trim() ||
      name.toLowerCase().replace(/[^a-z0-9]/g, "") + randomSuffix;

    // Check if username already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username: generatedUsername },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email is already taken by another account." },
        { status: 400 }
      );
    }

    // Hash default or provided password
    const rawPassword = password || "student123";
    const hashedPassword = await hashPassword(rawPassword);

    // Create user and student_record inside transaction
    const newStudent = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          name,
          email: email?.trim() || null,
          username: generatedUsername,
          code: studentCode,
          user_type: "student",
          gender: gender || null,
          dob: dob || null,
          phone: phone || null,
          address: address || null,
          bg_id: bg_id ? parseInt(bg_id) : null,
          password: hashedPassword,
        },
      });

      const record = await tx.student_records.create({
        data: {
          user_id: user.id,
          my_class_id: parseInt(my_class_id),
          section_id: parseInt(section_id),
          adm_no: generatedAdmNo,
          my_parent_id: my_parent_id ? parseInt(my_parent_id) : null,
          dorm_id: dorm_id ? parseInt(dorm_id) : null,
          dorm_room_no: dorm_room_no || null,
          session: session || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          age: age ? parseInt(age) : null,
          year_admitted: year_admitted || new Date().getFullYear().toString(),
          grad: 0,
        },
      });

      return { user, record };
    });

    return NextResponse.json({
      success: true,
      message: `Student ${name} successfully admitted with Admission No: ${newStudent.record.adm_no}`,
      student: newStudent,
    });
  } catch (error: any) {
    console.error("Student admission error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during admission." },
      { status: 500 }
    );
  }
}
