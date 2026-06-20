import React from "react";
import { prisma } from "@/lib/prisma";
import { Users, Mail, Phone, Calendar, Search } from "lucide-react";

export default async function UsersPage() {
  const usersList = await prisma.users.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Users Directory</h2>
          <p className="text-xs text-slate-600">
            View and manage all registered accounts (Staff, Admins, Teachers, Parents, and Students).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-650 border border-blue-100">
            Total Users: {usersList.length}
          </span>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-550/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs bg-blue-50/10">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Username</th>
                <th className="py-3 px-6">User Role</th>
                <th className="py-3 px-6">Email Address</th>
                <th className="py-3 px-6">Phone Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-slate-800">
              {usersList.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-semibold text-black">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-700">
                    {user.username || "—"}
                  </td>
                  <td className="py-4 px-6 text-xs capitalize">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${
                      user.user_type === "super_admin"
                        ? "bg-purple-100/50 text-purple-750"
                        : user.user_type === "admin"
                        ? "bg-blue-100 text-blue-800"
                        : user.user_type === "teacher"
                        ? "bg-emerald-100/70 text-emerald-800"
                        : user.user_type === "student"
                        ? "bg-sky-100/70 text-sky-800"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {user.user_type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-650">
                    {user.email ? (
                      <span className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        {user.email}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-650">
                    {user.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" />
                        {user.phone}
                      </span>
                    ) : (
                      "—"
                    )}
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
