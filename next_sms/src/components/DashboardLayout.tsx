"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Loading school dashboard...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-blue-50/20 text-black">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-blue-100 shadow-sm shadow-blue-50/10 z-10">
          <div>
            <h1 className="text-lg font-bold text-black">
              CJ INSPIRED ACADEMY
            </h1>
            <p className="text-xs text-slate-600">
              Session: 2018-2019 • Term Ends: 7/10/2018
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-650 border border-blue-100 capitalize">
              {user.user_type.replace("_", " ")} Portal
            </span>
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
