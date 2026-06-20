"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Key,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  School,
  BookMarked,
  Layers,
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "admin", "teacher", "student", "parent", "accountant", "librarian"],
  },
  {
    name: "My Account",
    href: "/my_account",
    icon: User,
    roles: ["super_admin", "admin", "teacher", "student", "parent", "accountant", "librarian"],
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
    roles: ["super_admin", "admin"],
  },
  {
    name: "Students",
    href: "/students",
    icon: GraduationCap,
    roles: ["super_admin", "admin", "teacher"],
  },
  {
    name: "My Children",
    href: "/my_children",
    icon: Users,
    roles: ["parent"],
  },
  {
    name: "Classes & Sections",
    href: "/classes",
    icon: School,
    roles: ["super_admin", "admin", "teacher"],
  },
  {
    name: "Subjects",
    href: "/subjects",
    icon: BookOpen,
    roles: ["super_admin", "admin", "teacher"],
  },
  {
    name: "Exams & Grades",
    href: "/exams",
    icon: ClipboardList,
    roles: ["super_admin", "admin"],
  },
  {
    name: "Marks & Reports",
    href: "/marks",
    icon: BookMarked,
    roles: ["super_admin", "admin", "teacher", "student", "parent"],
  },
  {
    name: "TimeTable",
    href: "/timetables",
    icon: Calendar,
    roles: ["super_admin", "admin", "teacher", "student"],
  },
  {
    name: "Payments & Fees",
    href: "/payments",
    icon: CreditCard,
    roles: ["super_admin", "admin", "accountant", "student", "parent"],
  },
  {
    name: "Scratch Cards / Pins",
    href: "/pins",
    icon: Key,
    roles: ["super_admin", "admin"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["super_admin"],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const filteredItems = SIDEBAR_ITEMS.filter((item) =>
    item.roles.includes(user.user_type)
  );

  return (
    <aside
      className={`relative h-screen bg-white text-black flex flex-col justify-between border-r border-slate-200 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 bg-blue-50/20">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
                CJ
              </div>
              <span className="font-bold text-base tracking-wide bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                CJ ACADEMY
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
              CJ
            </div>
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-650 hover:text-blue-800 cursor-pointer shadow-md z-50 transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* User Mini Profile */}
        {!collapsed && (
          <div className="p-4 mx-4 my-3 rounded-xl bg-blue-50/40 border border-blue-100 flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-650 overflow-hidden">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to user initials if image fails to load
                    (e.target as any).style.display = "none";
                  }}
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-slate-850">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 capitalize truncate">
                {user.user_type.replace("_", " ")}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="mt-4 px-3 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/10"
                    : "text-slate-655 hover:text-blue-650 hover:bg-blue-50/60"
                }`}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? "text-white" : "text-slate-500 group-hover:text-blue-650"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-200 bg-blue-50/10">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-all cursor-pointer group`}
        >
          <LogOut
            size={18}
            className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
          />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
