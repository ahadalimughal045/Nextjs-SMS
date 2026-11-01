"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Users,
  Calendar,
  Eye,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  School,
  Home,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";

interface StudentItem {
  id: number;
  user_id: number;
  my_class_id: number;
  section_id: number;
  adm_no: string | null;
  my_parent_id: number | null;
  dorm_id: number | null;
  dorm_room_no: string | null;
  session: string;
  age: number | null;
  year_admitted: string | null;
  grad: number;
  user?: {
    id: number;
    name: string;
    email: string | null;
    username: string | null;
    gender: string | null;
    phone: string | null;
    address: string | null;
    dob: string | null;
    bg_id: number | null;
  };
  myClass?: { id: number; name: string };
  section?: { id: number; name: string };
  parent?: { id: number; name: string; phone: string | null; email: string | null };
  dorm?: { id: number; name: string };
  bloodGroup?: { id: number; name: string };
}

interface ClassItem {
  id: number;
  name: string;
}

interface SectionItem {
  id: number;
  name: string;
  my_class_id: number;
}

interface DormItem {
  id: number;
  name: string;
}

interface ParentItem {
  id: number;
  name: string;
  phone: string | null;
}

interface BloodGroupItem {
  id: number;
  name: string;
}

interface Props {
  initialStudents: StudentItem[];
  classes: ClassItem[];
  sections: SectionItem[];
  dorms: DormItem[];
  parents: ParentItem[];
  bloodGroups: BloodGroupItem[];
  currentSession: string;
  userRole: string;
}

export default function StudentManager({
  initialStudents,
  classes,
  sections,
  dorms,
  parents,
  bloodGroups,
  currentSession,
  userRole,
}: Props) {
  const router = useRouter();
  const canAdmit = userRole === "super_admin" || userRole === "admin";

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modal States
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<StudentItem | null>(null);

  // Form States for Admission
  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    dob: "",
    email: "",
    username: "",
    phone: "",
    address: "",
    bg_id: "",
    my_class_id: "",
    section_id: "",
    adm_no: "",
    my_parent_id: "",
    dorm_id: "",
    dorm_room_no: "",
    session: currentSession,
    age: "",
    year_admitted: new Date().getFullYear().toString(),
    password: "student123",
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Filter sections by selected class in form
  const availableSectionsForForm = useMemo(() => {
    if (!formData.my_class_id) return [];
    return sections.filter((s) => s.my_class_id === parseInt(formData.my_class_id));
  }, [formData.my_class_id, sections]);

  // Filter students for table
  const filteredStudents = useMemo(() => {
    return initialStudents.filter((st) => {
      const matchesSearch =
        search === "" ||
        st.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        (st.adm_no && st.adm_no.toLowerCase().includes(search.toLowerCase())) ||
        (st.user?.username && st.user.username.toLowerCase().includes(search.toLowerCase()));

      const matchesClass =
        selectedClass === "all" || st.my_class_id.toString() === selectedClass;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && st.grad === 0) ||
        (selectedStatus === "graduated" && st.grad === 1);

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [initialStudents, search, selectedClass, selectedStatus]);

  const handleClassChange = (classId: string) => {
    setFormData((prev) => ({
      ...prev,
      my_class_id: classId,
      section_id: "", // reset section when class changes
    }));
  };

  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.my_class_id || !formData.section_id) {
      setFormError("Please fill in Student Name, Class, and Section.");
      return;
    }

    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSuccess(data.message);
        setTimeout(() => {
          setShowAdmitModal(false);
          setFormSuccess(null);
          // Reset form
          setFormData({
            name: "",
            gender: "Male",
            dob: "",
            email: "",
            username: "",
            phone: "",
            address: "",
            bg_id: "",
            my_class_id: "",
            section_id: "",
            adm_no: "",
            my_parent_id: "",
            dorm_id: "",
            dorm_room_no: "",
            session: currentSession,
            age: "",
            year_admitted: new Date().getFullYear().toString(),
            password: "student123",
          });
          router.refresh();
        }, 1200);
      } else {
        setFormError(data.error || "Failed to admit student.");
      }
    } catch (err: any) {
      setFormError("An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Students Directory</h2>
          <p className="text-xs text-slate-600">
            Manage student registrations, classroom enrollments, sessions, and academic dossiers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Total Students: {filteredStudents.length}
          </span>
          {canAdmit && (
            <button
              onClick={() => setShowAdmitModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Admit New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-blue-100 p-4 rounded-2xl shadow-sm shadow-blue-500/5 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or admission number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs text-slate-800 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-500/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs bg-blue-50/10">
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6">Admission No</th>
                <th className="py-3.5 px-6">Class & Section</th>
                <th className="py-3.5 px-6">Parent Contact</th>
                <th className="py-3.5 px-6">Active Session</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No matching students found in directory.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-black">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                          {st.user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{st.user?.name}</span>
                          <span className="block text-[10px] text-slate-450 font-normal mt-0.5">
                            {st.user?.gender || "—"} • Age: {st.age || "—"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-blue-650 font-semibold">
                      {st.adm_no || "—"}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded">
                          {st.myClass?.name || "No Class"}
                        </span>
                        {st.section && (
                          <span className="text-slate-500">
                            (Sec: {st.section.name})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {st.parent ? (
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {st.parent.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {st.parent.phone || "No Phone"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-650">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {st.session}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-medium ${
                          st.grad === 1
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-50 text-blue-850"
                        }`}
                      >
                        {st.grad === 1 ? "Graduated" : "Active"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedStudentForView(st)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-650 transition-colors cursor-pointer"
                        title="View Profile Dossier"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Admit New Student Form */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-100 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">Admit New Student</h3>
                  <p className="text-xs text-slate-500">Register student credentials, class, and parent link.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdmitModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2.5 text-rose-700 text-xs">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 text-emerald-700 text-xs">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAdmitSubmit} className="space-y-6">
              {/* Section 1: Personal Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  1. Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Adekunle"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Blood Group</label>
                    <select
                      value={formData.bg_id}
                      onChange={(e) => setFormData({ ...formData, bg_id: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((bg) => (
                        <option key={bg.id} value={bg.id.toString()}>
                          {bg.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Phone (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 08012345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Residential Address</label>
                    <input
                      type="text"
                      placeholder="Street address / city"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Enrollment */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  2. Academic Enrollment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Enrollment Class *</label>
                    <select
                      required
                      value={formData.my_class_id}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="">Choose Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Class Section *</label>
                    <select
                      required
                      disabled={!formData.my_class_id}
                      value={formData.section_id}
                      onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">
                        {!formData.my_class_id ? "Select Class First" : "Choose Section"}
                      </option>
                      {availableSectionsForForm.map((sec) => (
                        <option key={sec.id} value={sec.id.toString()}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Admission No</label>
                    <input
                      type="text"
                      placeholder="Leave blank to auto-generate"
                      value={formData.adm_no}
                      onChange={(e) => setFormData({ ...formData, adm_no: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Session</label>
                    <input
                      type="text"
                      value={formData.session}
                      onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 14"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Year Admitted</label>
                    <input
                      type="text"
                      value={formData.year_admitted}
                      onChange={(e) => setFormData({ ...formData, year_admitted: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Parent & Boarding */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  3. Parent Contact & Hostel Allocation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Assign Parent</label>
                    <select
                      value={formData.my_parent_id}
                      onChange={(e) => setFormData({ ...formData, my_parent_id: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="">No Parent Linked</option>
                      {parents.map((p) => (
                        <option key={p.id} value={p.id.toString()}>
                          {p.name} {p.phone ? `(${p.phone})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Dormitory / Hostel</label>
                    <select
                      value={formData.dorm_id}
                      onChange={(e) => setFormData({ ...formData, dorm_id: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="">Day Student (None)</option>
                      {dorms.map((d) => (
                        <option key={d.id} value={d.id.toString()}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.dorm_id && (
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">Dorm Room Number</label>
                      <input
                        type="text"
                        placeholder="e.g. Block B, Room 12"
                        value={formData.dorm_room_no}
                        onChange={(e) => setFormData({ ...formData, dorm_room_no: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {formLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Admitting Student...</span>
                    </>
                  ) : (
                    <span>Confirm Admission</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Student Dossier Profile Viewer */}
      {selectedStudentForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-blue-100 shadow-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  {selectedStudentForView.user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">{selectedStudentForView.user?.name}</h3>
                  <p className="text-xs text-blue-650 font-mono font-bold">
                    Adm No: {selectedStudentForView.adm_no || "N/A"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Academic Stats Pill Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                  <span className="text-slate-500 block text-[11px]">Class & Section</span>
                  <span className="font-bold text-slate-800">
                    {selectedStudentForView.myClass?.name || "N/A"}{" "}
                    {selectedStudentForView.section ? `(${selectedStudentForView.section.name})` : ""}
                  </span>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                  <span className="text-slate-500 block text-[11px]">Session</span>
                  <span className="font-bold text-slate-800">{selectedStudentForView.session}</span>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                  <span className="text-slate-500 block text-[11px]">Status</span>
                  <span
                    className={`font-bold ${
                      selectedStudentForView.grad === 1 ? "text-emerald-700" : "text-blue-700"
                    }`}
                  >
                    {selectedStudentForView.grad === 1 ? "Graduated" : "Active Student"}
                  </span>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                  <span className="text-slate-500 block text-[11px]">Hostel Room</span>
                  <span className="font-bold text-slate-800">
                    {selectedStudentForView.dorm?.name
                      ? `${selectedStudentForView.dorm.name} (${selectedStudentForView.dorm_room_no || "Room N/A"})`
                      : "Day Student"}
                  </span>
                </div>
              </div>

              {/* Bio Information */}
              <div className="p-4 rounded-xl border border-slate-100 space-y-2 bg-slate-50/40">
                <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
                  Student Bio & Contacts
                </h5>
                <div className="grid grid-cols-2 gap-2 text-slate-650">
                  <div>
                    Gender: <strong className="text-slate-800">{selectedStudentForView.user?.gender || "—"}</strong>
                  </div>
                  <div>
                    Age: <strong className="text-slate-800">{selectedStudentForView.age || "—"}</strong>
                  </div>
                  <div>
                    DOB: <strong className="text-slate-800">{selectedStudentForView.user?.dob || "—"}</strong>
                  </div>
                  <div>
                    Blood Group:{" "}
                    <strong className="text-slate-800">
                      {selectedStudentForView.bloodGroup?.name || "—"}
                    </strong>
                  </div>
                </div>
                {selectedStudentForView.user?.address && (
                  <div className="pt-2 text-slate-650 flex items-start gap-1">
                    <MapPin size={12} className="mt-0.5 text-slate-400 flex-shrink-0" />
                    <span>{selectedStudentForView.user.address}</span>
                  </div>
                )}
              </div>

              {/* Linked Parent Information */}
              <div className="p-4 rounded-xl border border-blue-100/60 bg-blue-50/30 space-y-1.5">
                <h5 className="font-bold text-blue-800 text-xs uppercase tracking-wider">
                  Parent / Guardian Details
                </h5>
                {selectedStudentForView.parent ? (
                  <div className="space-y-1 text-slate-700">
                    <p className="font-bold text-sm text-slate-900">{selectedStudentForView.parent.name}</p>
                    <p className="flex items-center gap-1 text-slate-600">
                      <Phone size={12} className="text-slate-400" />
                      <span>{selectedStudentForView.parent.phone || "No phone listed"}</span>
                    </p>
                    {selectedStudentForView.parent.email && (
                      <p className="flex items-center gap-1 text-slate-600">
                        <Mail size={12} className="text-slate-400" />
                        <span>{selectedStudentForView.parent.email}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No parent linked to this student record.</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href="/marks"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                View Marks Sheet
              </a>
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
