"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  School,
  User,
  Search,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface SubjectItem {
  id: number;
  name: string;
  slug: string;
  my_class_id: number;
  teacher_id: number;
  myClass?: { id: number; name: string } | null;
  teacher?: { id: number; name: string } | null;
}

interface ClassItem {
  id: number;
  name: string;
}

interface TeacherItem {
  id: number;
  name: string;
}

interface Props {
  initialSubjects: SubjectItem[];
  classes: ClassItem[];
  teachers: TeacherItem[];
  userRole: string;
}

export default function SubjectManager({
  initialSubjects,
  classes,
  teachers,
  userRole,
}: Props) {
  const router = useRouter();
  const canManage = userRole === "super_admin" || userRole === "admin";

  const [search, setSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [subjectName, setSubjectName] = useState("");
  const [subjectSlug, setSubjectSlug] = useState("");
  const [subjectClassId, setSubjectClassId] = useState("");
  const [subjectTeacherId, setSubjectTeacherId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredSubjects = useMemo(() => {
    return initialSubjects.filter((s) => {
      const matchesSearch =
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase());

      const matchesClass =
        selectedClassFilter === "all" ||
        s.my_class_id.toString() === selectedClassFilter;

      return matchesSearch && matchesClass;
    });
  }, [initialSubjects, search, selectedClassFilter]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !subjectClassId) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subjectName.trim(),
          slug: subjectSlug.trim() || undefined,
          my_class_id: subjectClassId,
          teacher_id: subjectTeacherId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setShowAddModal(false);
          setSubjectName("");
          setSubjectSlug("");
          setSubjectClassId("");
          setSubjectTeacherId("");
          setSuccess(null);
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || "Failed to add subject.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Curriculum Subjects</h2>
          <p className="text-xs text-slate-600">
            Manage academic subjects, assigned classes, and subject matter instructors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Total Subjects: {filteredSubjects.length}
          </span>
          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Subject</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-blue-100 p-4 rounded-2xl shadow-sm shadow-blue-500/5 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs text-slate-800 outline-none transition-all"
          />
        </div>

        <select
          value={selectedClassFilter}
          onChange={(e) => setSelectedClassFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="all">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id.toString()}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-blue-100">
            No matching curriculum subjects found.
          </div>
        ) : (
          filteredSubjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-blue-100 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm shadow-blue-500/5 hover:border-blue-300 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <BookOpen size={20} />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-bold text-black truncate">{sub.name}</h3>
                  <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-800 uppercase font-mono">
                    Slug: {sub.slug}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <School size={14} className="text-slate-400" />
                  <span>
                    Class: <strong className="text-slate-800">{sub.myClass?.name || "N/A"}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span>
                    Teacher:{" "}
                    <strong className="text-slate-800">
                      {sub.teacher?.name || "No Instructor Assigned"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add New Subject */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-blue-100 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                <span>Add Curriculum Subject</span>
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

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, English Language"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Short Code / Slug</label>
                <input
                  type="text"
                  placeholder="e.g. maths (leave blank to auto-generate)"
                  value={subjectSlug}
                  onChange={(e) => setSubjectSlug(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Target Class *</label>
                <select
                  required
                  value={subjectClassId}
                  onChange={(e) => setSubjectClassId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">Select Target Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Subject Teacher / Instructor</label>
                <select
                  value={subjectTeacherId}
                  onChange={(e) => setSubjectTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">No Instructor Assigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.name}
                    </option>
                  ))}
                </select>
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
                  <span>Save Subject</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
