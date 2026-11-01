import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  School,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40 text-slate-900 font-sans">
      {/* Navigation Header */}
      <header className="border-b border-blue-100/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-lg">
              CJ
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wide text-black block leading-tight">
                CJ INSPIRED ACADEMY
              </span>
              <span className="text-[11px] text-blue-650 font-semibold uppercase tracking-wider">
                School Management System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <span>Portal Sign In</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold shadow-sm">
            <Sparkles size={14} className="text-blue-600" />
            <span>Comprehensive Academic & Administrative Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Empowering Excellence in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Education & Management
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
            Streamlining admissions, classroom grading, report cards, fee receipts, and parent-student engagement under one unified portal.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Enter Portal</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-all"
            >
              Explore Capabilities
            </a>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black">
            Built for Administrators, Teachers & Parents
          </h2>
          <p className="text-sm text-slate-600">
            Everything your educational institution needs for everyday academic excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm shadow-blue-500/5 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-base font-bold text-black">Student Directory & Records</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track admissions, active sessions, class sections, hostels, and parent contacts in a structured directory.
            </p>
          </div>

          <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm shadow-blue-500/5 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="text-base font-bold text-black">Exams & Assessment Grading</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Manage continuous assessment scores (CA tests), terminal exams, subject positions, and remark guidelines.
            </p>
          </div>

          <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm shadow-blue-500/5 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-base font-bold text-black">Scratch Cards & Fee Invoices</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate secure verification PINs for report cards, track fee structures, and view invoice references.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-8 text-center text-xs text-slate-500 bg-white">
        <p>© {new Date().getFullYear()} CJ Inspired Academy. School Management System.</p>
      </footer>
    </div>
  );
}
