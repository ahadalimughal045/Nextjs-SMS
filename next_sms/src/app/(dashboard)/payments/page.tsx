import React from "react";
import { prisma } from "@/lib/prisma";
import { CreditCard, Award, User, ShoppingBag } from "lucide-react";

export default async function PaymentsPage() {
  const payments = await prisma.payments.findMany({ orderBy: { id: "desc" } });
  const classes = await prisma.my_classes.findMany();

  const paymentsList = payments.map((pay) => {
    const myClass = classes.find((c) => c.id === pay.my_class_id);
    return {
      ...pay,
      myClass,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Payments & Fees Management</h2>
          <p className="text-xs text-slate-600">
            List of student fee structures, tuition invoice payments, and other payment categories.
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-650 border border-blue-100">
            Total Items: {paymentsList.length}
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-550/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs bg-blue-50/10">
                <th className="py-3 px-6">Payment Title</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Reference No</th>
                <th className="py-3 px-6">Payment Method</th>
                <th className="py-3 px-6">Target Class</th>
                <th className="py-3 px-6">Session Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-slate-800">
              {paymentsList.map((pay) => (
                <tr key={pay.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-black">
                    <div>
                      <span>{pay.title}</span>
                      {pay.description && (
                        <span className="block text-[10px] text-slate-450 font-normal mt-0.5 max-w-[250px] truncate">
                          {pay.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs font-bold text-blue-700">
                    ₦{pay.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-700">
                    {pay.ref_no}
                  </td>
                  <td className="py-4 px-6 text-xs uppercase">
                    <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-800">
                      {pay.method}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-700 font-semibold">
                    {pay.myClass?.name || "All Classes"}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-650">
                    {pay.year}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
