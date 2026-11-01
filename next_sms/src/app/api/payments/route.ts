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

    if (
      payload.user_type !== "accountant" &&
      payload.user_type !== "admin" &&
      payload.user_type !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "Permission denied. Only Accountants and Admins can record fees and payments." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // Action 1: Create a Fee Structure
    if (action === "create_fee_structure") {
      const { title, amount, my_class_id, method, description, year } = body;

      if (!title || !amount) {
        return NextResponse.json(
          { error: "Fee title and amount are required." },
          { status: 400 }
        );
      }

      const refNo = `FEE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newFee = await prisma.payments.create({
        data: {
          title: title.trim(),
          amount: parseInt(amount),
          ref_no: refNo,
          method: method || "cash",
          my_class_id: my_class_id ? parseInt(my_class_id) : null,
          description: description?.trim() || null,
          year: year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Fee structure "${title}" created successfully.`,
        fee: newFee,
      });
    }

    // Action 2: Record a Student Payment
    if (action === "record_payment") {
      const { student_id, payment_id, amt_paid, year } = body;

      if (!student_id || !payment_id || !amt_paid) {
        return NextResponse.json(
          { error: "Student, fee category, and amount paid are required." },
          { status: 400 }
        );
      }

      const fee = await prisma.payments.findUnique({
        where: { id: parseInt(payment_id) },
      });

      if (!fee) {
        return NextResponse.json({ error: "Fee structure not found." }, { status: 404 });
      }

      const paidAmount = parseInt(amt_paid);
      const balance = Math.max(0, fee.amount - paidAmount);
      const isFullyPaid = balance === 0 ? 1 : 0;
      const refNo = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
      const paymentYear = year || fee.year;

      // Create Payment Record and Receipt inside transaction
      const result = await prisma.$transaction(async (tx) => {
        const paymentRecord = await tx.payment_records.create({
          data: {
            payment_id: fee.id,
            student_id: parseInt(student_id),
            ref_no: refNo,
            amt_paid: paidAmount,
            balance,
            paid: isFullyPaid,
            year: paymentYear,
          },
        });

        const receipt = await tx.receipts.create({
          data: {
            pr_id: paymentRecord.id,
            amt_paid: paidAmount,
            balance,
            year: paymentYear,
          },
        });

        return { paymentRecord, receipt };
      });

      return NextResponse.json({
        success: true,
        message: `Payment of ₦${paidAmount.toLocaleString()} successfully recorded for Reference #${refNo}.`,
        result,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
