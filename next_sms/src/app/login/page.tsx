"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Loader2, Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await refreshUser();
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login client error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50/80 via-white to-blue-50/50 overflow-hidden font-sans">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md px-6 z-10 animate-fade-in">
        {/* Logo/Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-600/20 mb-4 tracking-wider">
            CJ
          </div>
          <h2 className="text-2xl font-extrabold text-black tracking-wide">
            CJ INSPIRED ACADEMY
          </h2>
          <p className="text-slate-655 text-xs mt-1">
            School Management System Login
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white border border-blue-100 rounded-2xl p-8 shadow-xl shadow-blue-550/10">
          <h3 className="text-lg font-bold text-black mb-6">
            Sign In to Portal
          </h3>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-100 flex items-start gap-2.5 text-rose-600 text-sm">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username/Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Username or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. admin or teacher"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-black placeholder-slate-400 outline-none transition-all text-sm disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-black placeholder-slate-400 outline-none transition-all text-sm disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-550 disabled:bg-blue-600/50 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-600 mb-2">
              Demo Credentials (Password: <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-mono font-bold">cj</code>)
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-blue-50 text-blue-850 font-medium">
                SuperAdmin: <strong className="text-blue-900 font-bold">cj</strong>
              </span>
              <span className="px-2 py-1 rounded bg-blue-50 text-blue-850 font-medium">
                Admin: <strong className="text-blue-900 font-bold">admin</strong>
              </span>
              <span className="px-2 py-1 rounded bg-blue-50 text-blue-850 font-medium">
                Teacher: <strong className="text-blue-900 font-bold">teacher</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
