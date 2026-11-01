"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookMarked,
  Printer,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Calendar,
  School,
  User,
  Sparkles,
  FileText,
} from "lucide-react";

interface ClassItem {
  id: number;
  name: string;
}

interface SectionItem {
  id: number;
  name: string;
  my_class_id: number;
}

interface SubjectItem {
  id: number;
  name: string;
  my_class_id: number;
}

interface ExamItem {
  id: number;
  name: string;
  term: number;
  year: string;
}

interface StudentOption {
  id: number;
  name: string;
  adm_no: string | null;
  my_class_id: number;
}

interface Props {
  classes: ClassItem[];
  sections: SectionItem[];
  subjects: SubjectItem[];
  exams: ExamItem[];
  students: StudentOption[];
  userRole: string;
  currentUserId: number;
}

interface StudentMarkRow {
  student_id: number;
  name: string;
  adm_no: string | null;
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  exm: number;
  cum: number;
}

export default function MarksManager({
  classes,
  sections,
  subjects,
  exams,
  students,
  userRole,
  currentUserId,
}: Props) {
  const router = useRouter();
  const canEnterMarks =
    userRole === "teacher" || userRole === "admin" || userRole === "super_admin";

  const [activeTab, setActiveTab] = useState<"gradebook" | "report_card">(
    canEnterMarks ? "gradebook" : "report_card"
  );

  // Gradebook State
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState(
    exams.length > 0 ? exams[0].id.toString() : ""
  );

  const [markSheetRows, setMarkSheetRows] = useState<StudentMarkRow[]>([]);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Report Card State
  const [reportStudentId, setReportStudentId] = useState(
    userRole === "student"
      ? currentUserId.toString()
      : students.length > 0
      ? students[0].id.toString()
      : ""
  );
  const [reportExamId, setReportExamId] = useState(
    exams.length > 0 ? exams[0].id.toString() : ""
  );
  const [reportCardData, setReportCardData] = useState<any | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Filter sections and subjects by selected class in gradebook
  const availableSections = useMemo(() => {
    if (!selectedClassId) return [];
    return sections.filter((s) => s.my_class_id === parseInt(selectedClassId));
  }, [selectedClassId, sections]);

  const availableSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    return subjects.filter((s) => s.my_class_id === parseInt(selectedClassId));
  }, [selectedClassId, subjects]);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSectionId("");
    setSelectedSubjectId("");
    setMarkSheetRows([]);
  };

  // Helper to determine Grade from total
  const getGradeInfo = (total: number) => {
    if (total >= 70) return { grade: "A", color: "text-emerald-700 bg-emerald-50", remark: "Distinction" };
    if (total >= 60) return { grade: "B", color: "text-blue-700 bg-blue-50", remark: "Very Good" };
    if (total >= 50) return { grade: "C", color: "text-indigo-700 bg-indigo-50", remark: "Good" };
    if (total >= 45) return { grade: "D", color: "text-amber-700 bg-amber-50", remark: "Fair" };
    if (total >= 40) return { grade: "E", color: "text-orange-700 bg-orange-50", remark: "Pass" };
    return { grade: "F", color: "text-rose-700 bg-rose-50", remark: "Fail" };
  };

  // Load Gradebook Sheet
  const handleLoadSheet = async () => {
    if (!selectedClassId || !selectedSectionId || !selectedSubjectId || !selectedExamId) {
      setStatusMessage({
        type: "error",
        text: "Please select Class, Section, Subject, and Exam first.",
      });
      return;
    }

    setSheetLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(
        `/api/marks?action=sheet&class_id=${selectedClassId}&section_id=${selectedSectionId}&subject_id=${selectedSubjectId}&exam_id=${selectedExamId}`
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setMarkSheetRows(data.studentMarks);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to load marks sheet.",
        });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setSheetLoading(false);
    }
  };

  // Handle Mark Input change in row
  const handleMarkChange = (
    studentId: number,
    field: "t1" | "t2" | "t3" | "t4" | "exm",
    val: string
  ) => {
    const num = Math.max(0, parseInt(val) || 0);
    setMarkSheetRows((prev) =>
      prev.map((row) => {
        if (row.student_id === studentId) {
          const updated = { ...row, [field]: num };
          const tca = updated.t1 + updated.t2 + updated.t3 + updated.t4;
          const cum = tca + updated.exm;
          return {
            ...updated,
            cum,
          };
        }
        return row;
      })
    );
  };

  // Save All Marks
  const handleSaveMarks = async () => {
    if (markSheetRows.length === 0) return;

    setSaveLoading(true);
    setStatusMessage(null);

    const examObj = exams.find((e) => e.id === parseInt(selectedExamId));

    try {
      const res = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: selectedClassId,
          section_id: selectedSectionId,
          subject_id: selectedSubjectId,
          exam_id: selectedExamId,
          year: examObj?.year || "2026-2027",
          marksList: markSheetRows,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: data.message });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to save marks.",
        });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setSaveLoading(false);
    }
  };

  // Load Terminal Report Card
  const handleLoadReportCard = async () => {
    if (!reportStudentId || !reportExamId) return;

    setReportLoading(true);
    try {
      const res = await fetch(
        `/api/marks?action=report_card&student_id=${reportStudentId}&exam_id=${reportExamId}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setReportCardData(data.reportCard);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Academic Grading & Marks</h2>
          <p className="text-xs text-slate-600">
            Record continuous assessment (CA) scores, examination marks, and generate official terminal report cards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-blue-50/80 p-1 rounded-xl border border-blue-100">
          {canEnterMarks && (
            <button
              onClick={() => setActiveTab("gradebook")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "gradebook"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-blue-700"
              }`}
            >
              Teacher Gradebook Sheet
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab("report_card");
              if (!reportCardData && reportStudentId && reportExamId) {
                handleLoadReportCard();
              }
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "report_card"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-blue-700"
            }`}
          >
            Terminal Report Card
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
              : "bg-rose-50 text-rose-800 border-rose-100"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Tab 1: Gradebook Entry Sheet */}
      {activeTab === "gradebook" && canEnterMarks && (
        <div className="space-y-6">
          {/* Selector Card */}
          <div className="bg-white border border-blue-100 p-5 rounded-2xl shadow-sm shadow-blue-500/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="">Choose Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Section</label>
              <select
                disabled={!selectedClassId}
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {!selectedClassId ? "Select Class First" : "Choose Section"}
                </option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id.toString()}>
                    Section {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Subject</label>
              <select
                disabled={!selectedClassId}
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {!selectedClassId ? "Select Class First" : "Choose Subject"}
                </option>
                {availableSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id.toString()}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Exam Term</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id.toString()}>
                    {ex.name} ({ex.year})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={handleLoadSheet}
                disabled={sheetLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {sheetLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load Mark Sheet</span>
                )}
              </button>
            </div>
          </div>

          {/* Mark Sheet Spreadsheet */}
          {markSheetRows.length > 0 ? (
            <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-500/5 space-y-4">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-black">
                    Continuous Assessment & Examination Scores
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    CA Tests (T1–T4: max 10 each, CA Total: 40) • Terminal Exam (max 60) • Total Cumulative (100)
                  </p>
                </div>

                <button
                  onClick={handleSaveMarks}
                  disabled={saveLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {saveLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving All Marks...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save All Marks</span>
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-blue-50 text-slate-500 font-bold bg-blue-50/20 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-5">Student</th>
                      <th className="py-3 px-3 text-center">T1 (10)</th>
                      <th className="py-3 px-3 text-center">T2 (10)</th>
                      <th className="py-3 px-3 text-center">T3 (10)</th>
                      <th className="py-3 px-3 text-center">T4 (10)</th>
                      <th className="py-3 px-3 text-center">CA Total (40)</th>
                      <th className="py-3 px-3 text-center">Exam (60)</th>
                      <th className="py-3 px-4 text-center">Total (100)</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {markSheetRows.map((row) => {
                      const tca = row.t1 + row.t2 + row.t3 + row.t4;
                      const cum = tca + row.exm;
                      const gradeInfo = getGradeInfo(cum);

                      return (
                        <tr key={row.student_id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-3 px-5">
                            <span className="font-bold text-slate-900 block">{row.name}</span>
                            <span className="text-[10px] text-blue-650 font-mono">
                              {row.adm_no || "No Adm"}
                            </span>
                          </td>

                          {/* T1 */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={row.t1}
                              onChange={(e) => handleMarkChange(row.student_id, "t1", e.target.value)}
                              className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-500"
                            />
                          </td>

                          {/* T2 */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={row.t2}
                              onChange={(e) => handleMarkChange(row.student_id, "t2", e.target.value)}
                              className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-500"
                            />
                          </td>

                          {/* T3 */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={row.t3}
                              onChange={(e) => handleMarkChange(row.student_id, "t3", e.target.value)}
                              className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-500"
                            />
                          </td>

                          {/* T4 */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={row.t4}
                              onChange={(e) => handleMarkChange(row.student_id, "t4", e.target.value)}
                              className="w-14 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-500"
                            />
                          </td>

                          {/* CA Total */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-700 bg-slate-50/50">
                            {tca}
                          </td>

                          {/* Exam */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={60}
                              value={row.exm}
                              onChange={(e) => handleMarkChange(row.student_id, "exm", e.target.value)}
                              className="w-16 text-center py-1.5 bg-blue-50/60 border border-blue-200 rounded-lg text-xs font-mono font-bold text-blue-900 outline-none focus:border-blue-500"
                            />
                          </td>

                          {/* Total */}
                          <td className="py-3 px-4 text-center font-mono font-extrabold text-sm text-black">
                            {cum}
                          </td>

                          {/* Grade Pill */}
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-xs ${gradeInfo.color}`}
                            >
                              {gradeInfo.grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-blue-100 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select Class, Section, and Subject above and click <strong>&quot;Load Mark Sheet&quot;</strong> to start recording scores.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Terminal Report Card */}
      {activeTab === "report_card" && (
        <div className="space-y-6">
          {/* Student & Exam Selector */}
          <div className="bg-white border border-blue-100 p-5 rounded-2xl shadow-sm shadow-blue-500/5 flex flex-col sm:flex-row items-end gap-4 print:hidden">
            <div className="space-y-1 flex-1 w-full">
              <label className="text-xs font-semibold text-slate-700">Student</label>
              <select
                disabled={userRole === "student"}
                value={reportStudentId}
                onChange={(e) => setReportStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id.toString()}>
                    {st.name} ({st.adm_no || "No Adm"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 flex-1 w-full">
              <label className="text-xs font-semibold text-slate-700">Exam Term</label>
              <select
                value={reportExamId}
                onChange={(e) => setReportExamId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id.toString()}>
                    {ex.name} ({ex.year})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleLoadReportCard}
                disabled={reportLoading}
                className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {reportLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                <span>Generate Report</span>
              </button>

              {reportCardData && (
                <button
                  onClick={() => window.print()}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-md shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Card</span>
                </button>
              )}
            </div>
          </div>

          {/* Printable Report Card Sheet */}
          {reportCardData ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
              {/* Report Header */}
              <div className="text-center border-b border-slate-200 pb-6 space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md shadow-blue-500/20">
                  CJ
                </div>
                <h1 className="text-2xl font-black text-black tracking-wide uppercase">
                  CJ INSPIRED ACADEMY
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Official Continuous Assessment & Terminal Examination Report Sheet
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 font-bold text-xs rounded-full border border-blue-200/80">
                  <span>{reportCardData.exam.name}</span> • <span>Term {reportCardData.exam.term}</span> • <span>Session: {reportCardData.exam.year}</span>
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{reportCardData.student.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Admission No:</span>
                  <span className="font-mono font-bold text-blue-700">{reportCardData.student.adm_no || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Class & Section:</span>
                  <span className="font-bold text-slate-900">
                    {reportCardData.student.className} ({reportCardData.student.sectionName})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Academic Year:</span>
                  <span className="font-bold text-slate-900">{reportCardData.student.session}</span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="py-3 px-4">Curriculum Subject</th>
                      <th className="py-3 px-3 text-center">CA (40)</th>
                      <th className="py-3 px-3 text-center">Exam (60)</th>
                      <th className="py-3 px-3 text-center">Total (100)</th>
                      <th className="py-3 px-3 text-center">Grade</th>
                      <th className="py-3 px-4">System Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {reportCardData.subjects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                          No marks recorded yet for this terminal examination.
                        </td>
                      </tr>
                    ) : (
                      reportCardData.subjects.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-black">{sub.subjectName}</td>
                          <td className="py-3 px-3 text-center font-mono">{sub.tca}</td>
                          <td className="py-3 px-3 text-center font-mono">{sub.exm}</td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-blue-700 text-sm">
                            {sub.total}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded font-bold text-xs bg-slate-100">
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-650 italic">{sub.remark}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Performance Summary Pill */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Aggregate Score:</span>
                  <span className="text-xl font-extrabold text-blue-900 font-mono">
                    {reportCardData.summary.totalMarks} / {reportCardData.summary.totalSubjects * 100}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Terminal Average:</span>
                  <span className="text-xl font-extrabold text-blue-900 font-mono">
                    {reportCardData.summary.average}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Subjects Evaluated:</span>
                  <span className="text-xl font-extrabold text-slate-800 font-mono">
                    {reportCardData.summary.totalSubjects}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
                <div className="space-y-6">
                  <div className="border-b border-slate-300 w-48 mx-auto" />
                  <p className="font-semibold text-slate-700">Class Teacher&apos;s Signature & Date</p>
                </div>
                <div className="space-y-6">
                  <div className="border-b border-slate-300 w-48 mx-auto" />
                  <p className="font-semibold text-slate-700">Principal&apos;s Signature & Stamp</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-blue-100 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select student and exam above and click <strong>&quot;Generate Report&quot;</strong> to preview terminal marks sheet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
