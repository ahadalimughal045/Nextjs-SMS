import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Users,
  GraduationCap,
  School,
  CreditCard,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyJWT(token);
  if (!payload || !payload.userId) {
    redirect("/login");
  }

  const user = await prisma.users.findUnique({
    where: { id: payload.userId as number },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch metrics based on role
  const totalStudents = await prisma.users.count({ where: { user_type: "student" } });
  const totalTeachers = await prisma.users.count({ where: { user_type: "teacher" } });
  const totalParents = await prisma.users.count({ where: { user_type: "parent" } });
  const totalClasses = await prisma.my_classes.count();
  const totalDorms = await prisma.dorms.count();

  // Get recent users to display in a table
  const recentUsers = await prisma.users.findMany({
    take: 5,
    orderBy: { id: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      user_type: true,
      email: true,
      created_at: true,
    },
  });

  // Calculate payment stats
  const totalPayments = await prisma.payments.aggregate({
    _sum: {
      amount: true,
    },
  });
  const sumAmount = totalPayments._sum.amount || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-850 p-6 md:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl transform translate-x-12 -translate-y-12" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-50">
            <Sparkles size={12} />
            System Live Update
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name}!
          </h2>
          <p className="text-sm text-blue-100 max-w-xl font-light">
            Here's the latest summary for CJ Inspired Academy. Manage classes, students, records, and view payments seamlessly.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Students */}
        <div className="bg-white border border-blue-100 rounded-2xl p-5 flex items-center gap-5 shadow-sm shadow-blue-550/5 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Students
            </p>
            <h3 className="text-2xl font-bold mt-1 text-black">
              {totalStudents}
            </h3>
          </div>
        </div>

        {/* Card 2: Teachers */}
        <div className="bg-white border border-blue-100 rounded-2xl p-5 flex items-center gap-5 shadow-sm shadow-blue-550/5 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Teachers
            </p>
            <h3 className="text-2xl font-bold mt-1 text-black">
              {totalTeachers}
            </h3>
          </div>
        </div>

        {/* Card 3: Classes */}
        <div className="bg-white border border-blue-100 rounded-2xl p-5 flex items-center gap-5 shadow-sm shadow-blue-550/5 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-605">
            <School size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Classes
            </p>
            <h3 className="text-2xl font-bold mt-1 text-black">
              {totalClasses}
            </h3>
          </div>
        </div>

        {/* Card 4: Fee Structure */}
        <div className="bg-white border border-blue-100 rounded-2xl p-5 flex items-center gap-5 shadow-sm shadow-blue-550/5 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Payment Invoiced
            </p>
            <h3 className="text-2xl font-bold mt-1 text-black truncate">
              ₦{sumAmount.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registered Users */}
        <div className="lg:col-span-2 bg-white border border-blue-100 rounded-2xl p-6 shadow-sm shadow-blue-550/5">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-base font-bold text-black">
              Recently Registered Users
            </h4>
            <span className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-0.5 font-medium">
              View all <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs">
                  <th className="pb-3 pl-2">Name</th>
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3 pr-2">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 text-slate-800">
                {recentUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 pl-2 font-semibold text-black">
                      {item.name}
                    </td>
                    <td className="py-3 text-xs font-mono">{item.username}</td>
                    <td className="py-3 text-xs capitalize">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${
                        item.user_type === "super_admin"
                          ? "bg-purple-100/50 text-purple-750"
                          : item.user_type === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : item.user_type === "teacher"
                          ? "bg-emerald-100/70 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {item.user_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-xs truncate max-w-[150px]">
                      {item.email || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Sidebar Panel */}
        <div className="space-y-6">
          {/* Quick Stats Summary */}
          <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm shadow-blue-550/5">
            <h4 className="text-base font-bold text-black mb-4">
              Institution Stats
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Parents registered
                </span>
                <span className="font-bold text-slate-850">{totalParents}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Dormitories active
                </span>
                <span className="font-bold text-slate-850">{totalDorms}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Calendar Schedules
                </span>
                <span className="font-bold text-slate-850">Active Term</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-blue-500/10">
            <div className="absolute bottom-[-20%] right-[-10%] w-24 h-24 bg-blue-500/25 rounded-full blur-xl pointer-events-none" />
            <h4 className="text-sm font-bold tracking-wide uppercase text-blue-100 mb-2">
              Need Assistance?
            </h4>
            <p className="text-xs text-blue-100/90 leading-relaxed mb-4">
              Access support guides, view terms and privacy guidelines, or reach out to the development team.
            </p>
            <div className="flex gap-3 text-xs">
              <button className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors text-white font-medium shadow shadow-blue-500/10 cursor-pointer">
                Docs
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium cursor-pointer">
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
