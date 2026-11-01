"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  School,
  Plus,
  Users,
  UserCheck,
  Layers,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Award,
} from "lucide-react";

interface SectionWithTeacher {
  id: number;
  name: string;
  teacher_id: number | null;
  teacher?: { id: number; name: string } | null;
}

interface ClassWithRelations {
  id: number;
  name: string;
  class_type_id: number | null;
  type?: { id: number; name: string; code: string } | null;
  sections: SectionWithTeacher[];
  studentCount: number;
}

interface ClassType {
  id: number;
  name: string;
  code: string;
}

interface Teacher {
  id: number;
  name: string;
}

interface Props {
  initialClasses: ClassWithRelations[];
  classTypes: ClassType[];
  teachers: Teacher[];
  userRole: string;
}

export default function ClassManager({
  initialClasses,
  classTypes,
  teachers,
  userRole,
}: Props) {
  const router = useRouter();
  const canManage = userRole === "super_admin" || userRole === "admin";

  // Modals
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [selectedClassForSection, setSelectedClassForSection] = useState<ClassWithRelations | null>(null);

  // Form states - Create Class
  const [newClassName, setNewClassName] = useState("");
  const [newClassTypeId, setNewClassTypeId] = useState("");

  // Form states - Create Section
  const [newSectionName, setNewSectionName] = useState("");
  const [sectionTeacherId, setSectionTeacherId] = useState("");

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_class",
          name: newClassName.trim(),
          class_type_id: newClassTypeId || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setShowCreateClassModal(false);
          setNewClassName("");
          setNewClassTypeId("");
          setSuccess(null);
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || "Failed to create class.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !selectedClassForSection) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_section",
          name: newSectionName.trim(),
          my_class_id: selectedClassForSection.id,
          teacher_id: sectionTeacherId || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setSelectedClassForSection(null);
          setNewSectionName("");
          setSectionTeacherId("");
          setSuccess(null);
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || "Failed to create section.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Classes & Sections</h2>
          <p className="text-xs text-slate-600">
            Configure academic classes, active streams/sections, and designated class teachers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Total Classes: {initialClasses.length}
          </span>
          {canManage && (
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Create New Class</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-white border border-blue-100 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm shadow-blue-500/5 hover:border-blue-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <School size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-black">{cls.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      Type: <span className="font-semibold text-blue-700">{cls.type?.name || "General"}</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <Users size={12} className="text-blue-500" />
                  {cls.studentCount}
                </span>
              </div>

              {/* Sections list */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Sections ({cls.sections.length})
                  </span>
                  {canManage && (
                    <button
                      onClick={() => setSelectedClassForSection(cls)}
                      className="text-[11px] text-blue-650 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Section</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {cls.sections.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No sections created yet.</p>
                  ) : (
                    cls.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-2.5 bg-blue-50/40 rounded-xl border border-blue-100/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {sec.name}
                          </span>
                          <span className="font-semibold text-slate-800">Section {sec.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {sec.teacher ? (
                            <span className="flex items-center gap-1 text-slate-700 font-medium">
                              <UserCheck size={12} className="text-emerald-600" />
                              {sec.teacher.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No Teacher</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: Create New Class */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-blue-100 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <School size={18} className="text-blue-600" />
                <span>Create New Class</span>
              </h3>
              <button
                onClick={() => setShowCreateClassModal(false)}
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

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary 1 or JSS 1"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Class Type / Tier</label>
                <select
                  value={newClassTypeId}
                  onChange={(e) => setNewClassTypeId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">Select Class Type</option>
                  {classTypes.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
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
                  <span>Save Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Section */}
      {selectedClassForSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-blue-100 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <Layers size={18} className="text-blue-600" />
                  <span>Add Section to {selectedClassForSection.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedClassForSection(null)}
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

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Section Name / Stream *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B, Gold, or Diamond"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Assign Class Teacher</label>
                <select
                  value={sectionTeacherId}
                  onChange={(e) => setSectionTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">No Teacher Assigned</option>
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
                  onClick={() => setSelectedClassForSection(null)}
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
                  <span>Add Section</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
