import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Action 1: Load Gradebook Sheet for a specific Class, Section, Subject, Exam
    if (action === "sheet") {
      const classId = searchParams.get("class_id");
      const sectionId = searchParams.get("section_id");
      const subjectId = searchParams.get("subject_id");
      const examId = searchParams.get("exam_id");

      if (!classId || !sectionId || !subjectId || !examId) {
        return NextResponse.json(
          { error: "class_id, section_id, subject_id, and exam_id are required." },
          { status: 400 }
        );
      }

      // Find all students in this class and section
      const studentRecords = await prisma.student_records.findMany({
        where: {
          my_class_id: parseInt(classId),
          section_id: parseInt(sectionId),
          grad: 0,
        },
      });

      const userIds = studentRecords.map((s) => s.user_id);
      const studentUsers = await prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });

      // Find existing marks for this subject & exam
      const existingMarks = await prisma.marks.findMany({
        where: {
          my_class_id: parseInt(classId),
          section_id: parseInt(sectionId),
          subject_id: parseInt(subjectId),
          exam_id: parseInt(examId),
        },
      });

      const studentMarks = studentRecords.map((rec) => {
        const user = studentUsers.find((u) => u.id === rec.user_id);
        const mark = existingMarks.find((m) => m.student_id === rec.user_id);

        return {
          student_id: rec.user_id,
          name: user?.name || "Student",
          adm_no: rec.adm_no,
          t1: mark?.t1 ?? 0,
          t2: mark?.t2 ?? 0,
          t3: mark?.t3 ?? 0,
          t4: mark?.t4 ?? 0,
          exm: mark?.exm ?? 0,
          cum: mark?.cum ?? 0,
        };
      });

      return NextResponse.json({ success: true, studentMarks });
    }

    // Action 2: Load Terminal Report Card for a specific student & exam
    if (action === "report_card") {
      const studentId = searchParams.get("student_id");
      const examId = searchParams.get("exam_id");

      if (!studentId || !examId) {
        return NextResponse.json(
          { error: "student_id and exam_id are required." },
          { status: 400 }
        );
      }

      const sId = parseInt(studentId);
      const eId = parseInt(examId);

      const user = await prisma.users.findUnique({ where: { id: sId } });
      const record = await prisma.student_records.findFirst({
        where: { user_id: sId },
      });

      if (!user || !record) {
        return NextResponse.json({ error: "Student not found." }, { status: 404 });
      }

      const myClass = await prisma.my_classes.findUnique({
        where: { id: record.my_class_id },
      });
      const section = await prisma.sections.findUnique({
        where: { id: record.section_id },
      });
      const exam = await prisma.exams.findUnique({ where: { id: eId } });

      const marks = await prisma.marks.findMany({
        where: { student_id: sId, exam_id: eId },
      });

      const subjects = await prisma.subjects.findMany();
      const grades = await prisma.grades.findMany({
        orderBy: { mark_from: "desc" },
      });

      const marksBreakdown = marks.map((m) => {
        const subject = subjects.find((s) => s.id === m.subject_id);
        const total = m.cum ?? (m.t1 || 0) + (m.t2 || 0) + (m.t3 || 0) + (m.t4 || 0) + (m.exm || 0);

        // Determine grade
        const matchedGrade = grades.find(
          (g) => total >= g.mark_from && total <= g.mark_to
        );

        return {
          id: m.id,
          subjectName: subject?.name || "Subject",
          t1: m.t1 || 0,
          t2: m.t2 || 0,
          t3: m.t3 || 0,
          t4: m.t4 || 0,
          tca: (m.t1 || 0) + (m.t2 || 0) + (m.t3 || 0) + (m.t4 || 0),
          exm: m.exm || 0,
          total,
          grade: matchedGrade?.name || "F",
          remark: matchedGrade?.remark || "Pass",
        };
      });

      // Calculate totals and averages
      const totalMarks = marksBreakdown.reduce((sum, item) => sum + item.total, 0);
      const averageMarks =
        marksBreakdown.length > 0
          ? (totalMarks / marksBreakdown.length).toFixed(1)
          : "0.0";

      return NextResponse.json({
        success: true,
        reportCard: {
          student: {
            id: user.id,
            name: user.name,
            adm_no: record.adm_no,
            session: record.session,
            className: myClass?.name || "N/A",
            sectionName: section?.name || "N/A",
          },
          exam: {
            name: exam?.name || "Examination",
            term: exam?.term,
            year: exam?.year,
          },
          subjects: marksBreakdown,
          summary: {
            totalMarks,
            average: averageMarks,
            totalSubjects: marksBreakdown.length,
          },
        },
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Marks GET error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
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

    // Only teachers, admins, or super_admins can enter marks
    if (
      payload.user_type !== "teacher" &&
      payload.user_type !== "admin" &&
      payload.user_type !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "Permission denied. Only Teachers and Admins can record marks." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { class_id, section_id, subject_id, exam_id, year, marksList } = body;

    if (!class_id || !section_id || !subject_id || !exam_id || !Array.isArray(marksList)) {
      return NextResponse.json(
        { error: "Incomplete marks submission payload." },
        { status: 400 }
      );
    }

    const cId = parseInt(class_id);
    const sId = parseInt(section_id);
    const subId = parseInt(subject_id);
    const eId = parseInt(exam_id);
    const examYear = year || new Date().getFullYear().toString();

    // Grades scale lookup
    const grades = await prisma.grades.findMany({
      orderBy: { mark_from: "desc" },
    });

    // Save/Upsert marks for each student
    for (const item of marksList) {
      const t1 = parseInt(item.t1) || 0;
      const t2 = parseInt(item.t2) || 0;
      const t3 = parseInt(item.t3) || 0;
      const t4 = parseInt(item.t4) || 0;
      const exm = parseInt(item.exm) || 0;
      const tca = t1 + t2 + t3 + t4;
      const cum = tca + exm;

      const matchedGrade = grades.find(
        (g) => cum >= g.mark_from && cum <= g.mark_to
      );

      // Check if mark already exists
      const existing = await prisma.marks.findFirst({
        where: {
          student_id: item.student_id,
          my_class_id: cId,
          section_id: sId,
          subject_id: subId,
          exam_id: eId,
        },
      });

      if (existing) {
        await prisma.marks.update({
          where: { id: existing.id },
          data: {
            t1,
            t2,
            t3,
            t4,
            tca,
            exm,
            cum,
            grade_id: matchedGrade ? matchedGrade.id : null,
            year: examYear,
          },
        });
      } else {
        await prisma.marks.create({
          data: {
            student_id: item.student_id,
            my_class_id: cId,
            section_id: sId,
            subject_id: subId,
            exam_id: eId,
            t1,
            t2,
            t3,
            t4,
            tca,
            exm,
            cum,
            grade_id: matchedGrade ? matchedGrade.id : null,
            year: examYear,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved marks for ${marksList.length} students.`,
    });
  } catch (error: any) {
    console.error("Marks POST error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
