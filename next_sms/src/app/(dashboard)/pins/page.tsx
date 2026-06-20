import React from "react";
import { prisma } from "@/lib/prisma";
import { Key, ShieldAlert, CheckCircle, HelpCircle } from "lucide-react";

export default async function PinsPage() {
  const pins = await prisma.pins.findMany({ take: 30, orderBy: { id: "desc" } });
  const users = await prisma.users.findMany();

  const pinsList = pins.map((p) => {
    const studentUser = users.find((u) => u.id === p.student_id);
    return {
      ...p,
      studentUser,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Scratch Cards & PINs</h2>
          <p className="text-xs text-slate-600">
            View generated validation PIN codes used by parents/students to access academic report cards.
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-650 border border-blue-100">
            Showing Last 30 PINs
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-550/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs bg-blue-50/10">
                <th className="py-3 px-6">PIN Code</th>
                <th className="py-3 px-6">Usage Status</th>
                <th className="py-3 px-6">Used Times</th>
                <th className="py-3 px-6">Used By (Student)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-slate-800">
              {pinsList.map((pin) => (
                <tr key={pin.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs font-bold text-blue-700">
                    <span className="flex items-center gap-1.5">
                      <Key size={14} className="text-blue-500" />
                      {pin.code}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs font-medium">
                    {pin.used === "1" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle size={12} /> Used
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <HelpCircle size={12} /> Unused
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-xs font-mono text-slate-700">
                    {pin.times_used} time(s)
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-800 font-semibold">
                    {pin.studentUser?.name || "—"}
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
