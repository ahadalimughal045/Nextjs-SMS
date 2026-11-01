"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  UserCheck,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from "lucide-react";

interface UserItem {
  id: number;
  name: string;
  email: string | null;
  username: string | null;
  user_type: string;
  phone: string | null;
  photo?: string | null;
}

interface Props {
  initialUsers: UserItem[];
  userRole: string;
}

export default function UserManager({ initialUsers, userRole }: Props) {
  const router = useRouter();
  const canCreateUser = userRole === "super_admin" || userRole === "admin";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("teacher");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("cj123");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((u) => {
      const term = search.toLowerCase();
      const matchesSearch =
        term === "" ||
        u.name.toLowerCase().includes(term) ||
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.phone && u.phone.includes(term));

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "staff" && (u.user_type === "teacher" || u.user_type === "accountant" || u.user_type === "librarian")) ||
        u.user_type === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [initialUsers, search, roleFilter]);

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !userType) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          username: username.trim() || undefined,
          user_type: userType,
          phone: phone.trim() || undefined,
          password: password || "cj123",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setShowAddModal(false);
          setName("");
          setEmail("");
          setUsername("");
          setPhone("");
          setPassword("cj123");
          setSuccess(null);
          router.refresh();
        }, 1200);
      } else {
        setError(data.error || "Failed to register user.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "teacher":
        return "bg-emerald-100 text-emerald-800";
      case "accountant":
        return "bg-amber-100 text-amber-800";
      case "librarian":
        return "bg-cyan-100 text-cyan-800";
      case "parent":
        return "bg-rose-100 text-rose-800";
      case "student":
        return "bg-sky-100 text-sky-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">User Accounts & Staff Directory</h2>
          <p className="text-xs text-slate-600">
            View registered system users and provision new accounts for Teachers, Accountants, and Staff.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Total Users: {filteredUsers.length}
          </span>
          {canCreateUser && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Register New User</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-blue-100 p-4 rounded-2xl shadow-sm shadow-blue-500/5 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, username, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs text-slate-800 outline-none transition-all"
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setRoleFilter("teacher")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === "teacher" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            Teachers
          </button>
          <button
            onClick={() => setRoleFilter("parent")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === "parent" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-rose-700"
            }`}
          >
            Parents
          </button>
          <button
            onClick={() => setRoleFilter("admin")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === "admin" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-blue-700"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setRoleFilter("staff")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === "staff" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:text-amber-700"
            }`}
          >
            Other Staff
          </button>
        </div>
      </div>

      {/* Users Table */}
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    No matching accounts found in directory.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
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
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-[11px] ${getRoleBadge(
                          user.user_type
                        )}`}
                      >
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register New User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-blue-100 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                <span>Register New Staff / Account</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-100">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-100">
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maryam Abubakar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">System Role *</label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 font-bold"
                >
                  <option value="teacher">Teacher (Instructor)</option>
                  <option value="accountant">Accountant (Bursar)</option>
                  <option value="librarian">Librarian</option>
                  <option value="admin">Administrator</option>
                  <option value="parent">Parent / Guardian</option>
                  {userRole === "super_admin" && (
                    <option value="super_admin">Super Administrator</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Username</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Initial Password</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. staff@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 08012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Register Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
