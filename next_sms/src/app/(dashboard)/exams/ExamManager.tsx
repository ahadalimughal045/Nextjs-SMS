"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Award,
  Calendar,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface ExamItem {
  id: number;
  name: string;
  term: number;
  year: string;
}

interface GradeItem {
  id: number;
  name: string;
  mark_from: number;
  mark_to: number;
  remark: string | null;
}

interface Props {
  initialExams: ExamItem[];
  grades: GradeItem[];
  currentSession: string;
  userRole: string;
}

export default function ExamManager({
  initialExams,
  grades,
  currentSession,
  userRole,
}: Props) {
  const router = useRouter();
  const canManage = userRole === "super_admin" || userRole === "admin";

  const [showAddModal, setShowAddModal] = useState(false);
  const [examName, setExamName] = useState("");
  const [examTerm, setExamTerm] = useState("1");
  const [examYear, setExamYear] = useState(currentSession);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !examTerm || !examYear.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: examName.trim(),
          term: examTerm,
          year: examYear.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setShowAddModal(false);
          setExamName("");
          setSuccess(null);
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || "Failed to schedule exam.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Section: Exams Schedule */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-black">Exams Schedule</h2>
            <p className="text-xs text-slate-600">
              Active and past terminal examination terms configured for CJ Inspired Academy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Total Terms: {initialExams.length}
            </span>
            {canManage && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Schedule New Exam</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialExams.map((ex) => (
            <div
              key={ex.id}
              className="bg-white border border-blue-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm shadow-blue-500/5 hover:border-blue-300 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <ClipboardList size={20} />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-black truncate">{ex.name}</h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-400" />
                  <span>Session: {ex.year}</span>
                </p>
                <span className="inline-flex mt-1 px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-800 uppercase">
                  Term {ex.term}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Grade Scale Guidelines */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-black">Academic Grading System & Scale</h2>
          <p className="text-xs text-slate-600">
            Remark criteria and percentage ranges for automatic report card score conversions.
          </p>
        </div>
        <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-500/5 max-w-2xl">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs bg-blue-50/10">
                <th className="py-3 px-6">Grade Name</th>
                <th className="py-3 px-6">Percentage Range</th>
                <th className="py-3 px-6">Academic Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-slate-800">
              {grades.map((gr) => (
                <tr key={gr.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-blue-700">{gr.name}</td>
                  <td className="py-3.5 px-6 text-xs text-slate-700">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded font-semibold font-mono">
                      {gr.mark_from}% - {gr.mark_to}%
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-slate-650 font-medium">
                    {gr.remark || "Satisfactory"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Schedule New Exam */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-blue-100 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <ClipboardList size={18} className="text-blue-600" />
                <span>Schedule Terminal Exam</span>
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

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First Term Examination"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Term (1, 2, or 3) *</label>
                  <select
                    value={examTerm}
                    onChange={(e) => setExamTerm(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="1">Term 1 (First)</option>
                    <option value="2">Term 2 (Second)</option>
                    <option value="3">Term 3 (Third)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Academic Year *</label>
                  <input
                    type="text"
                    required
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value)}
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
                  <span>Save Exam</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
