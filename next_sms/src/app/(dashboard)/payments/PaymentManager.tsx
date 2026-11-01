"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  Receipt,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Printer,
  Calendar,
  School,
  DollarSign,
  FileCheck,
} from "lucide-react";

interface PaymentItem {
  id: number;
  title: string;
  amount: number;
  ref_no: string;
  method: string;
  my_class_id: number | null;
  description: string | null;
  year: string;
  myClass?: { id: number; name: string } | null;
}

interface PaymentRecordItem {
  id: number;
  payment_id: number;
  student_id: number;
  ref_no: string | null;
  amt_paid: number | null;
  balance: number | null;
  paid: number;
  year: string;
  student?: { id: number; name: string; adm_no: string | null; className?: string };
  fee?: PaymentItem;
  created_at?: string | null;
}

interface StudentOption {
  id: number;
  name: string;
  adm_no: string | null;
  className: string;
}

interface ClassOption {
  id: number;
  name: string;
}

interface Props {
  feeStructures: PaymentItem[];
  paymentRecords: PaymentRecordItem[];
  students: StudentOption[];
  classes: ClassOption[];
  currentSession: string;
  userRole: string;
}

export default function PaymentManager({
  feeStructures,
  paymentRecords,
  students,
  classes,
  currentSession,
  userRole,
}: Props) {
  const router = useRouter();
  const canManage =
    userRole === "super_admin" || userRole === "admin" || userRole === "accountant";

  const [activeTab, setActiveTab] = useState<"records" | "structures">("records");

  // Modals
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecordItem | null>(null);

  // Collect Payment Form States
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedFeeId, setSelectedFeeId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentSession, setPaymentSession] = useState(currentSession);

  // Create Fee Structure Form States
  const [feeTitle, setFeeTitle] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeClassId, setFeeClassId] = useState("");
  const [feeMethod, setFeeMethod] = useState("cash");
  const [feeDescription, setFeeDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Auto-fill amount when fee category is selected in Collect modal
  const handleFeeSelect = (feeId: string) => {
    setSelectedFeeId(feeId);
    const fee = feeStructures.find((f) => f.id === parseInt(feeId));
    if (fee) {
      setAmountPaid(fee.amount.toString());
    }
  };

  const selectedFeeObj = useMemo(() => {
    return feeStructures.find((f) => f.id === parseInt(selectedFeeId));
  }, [selectedFeeId, feeStructures]);

  const liveBalance = useMemo(() => {
    if (!selectedFeeObj) return 0;
    const paid = parseInt(amountPaid) || 0;
    return Math.max(0, selectedFeeObj.amount - paid);
  }, [selectedFeeObj, amountPaid]);

  // Record Payment Submit
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedFeeId || !amountPaid) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          student_id: selectedStudentId,
          payment_id: selectedFeeId,
          amt_paid: amountPaid,
          year: paymentSession,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setShowCollectModal(false);
          setSelectedStudentId("");
          setSelectedFeeId("");
          setAmountPaid("");
          setSuccess(null);
          router.refresh();
        }, 1200);
      } else {
        setError(data.error || "Failed to record payment.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Create Fee Structure Submit
  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeTitle.trim() || !feeAmount) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_fee_structure",
          title: feeTitle.trim(),
          amount: feeAmount,
          my_class_id: feeClassId || null,
          method: feeMethod,
          description: feeDescription.trim() || undefined,
          year: currentSession,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setShowFeeModal(false);
          setFeeTitle("");
          setFeeAmount("");
          setFeeClassId("");
          setFeeDescription("");
          setSuccess(null);
          router.refresh();
        }, 1200);
      } else {
        setError(data.error || "Failed to create fee structure.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Filtered payment records for search
  const filteredRecords = useMemo(() => {
    return paymentRecords.filter((rec) => {
      const term = search.toLowerCase();
      return (
        term === "" ||
        rec.student?.name.toLowerCase().includes(term) ||
        (rec.ref_no && rec.ref_no.toLowerCase().includes(term)) ||
        (rec.fee?.title && rec.fee.title.toLowerCase().includes(term))
      );
    });
  }, [paymentRecords, search]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Payments & Fees Management</h2>
          <p className="text-xs text-slate-600">
            Record student tuition fees, manage fee structures, and generate verified receipts.
          </p>
        </div>

        {/* Tab & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-blue-50/80 p-1 rounded-xl border border-blue-100">
            <button
              onClick={() => setActiveTab("records")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "records"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-blue-700"
              }`}
            >
              Recorded Payments
            </button>
            <button
              onClick={() => setActiveTab("structures")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "structures"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-blue-700"
              }`}
            >
              Fee Structures ({feeStructures.length})
            </button>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCollectModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Record Payment</span>
              </button>

              <button
                onClick={() => setShowFeeModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>New Fee Structure</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab 1: Recorded Payments */}
      {activeTab === "records" && (
        <div className="space-y-4">
          <div className="bg-white border border-blue-100 p-4 rounded-2xl shadow-sm shadow-blue-500/5 flex items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search payments by student name, reference number, or fee title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs text-slate-800 outline-none transition-all"
              />
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
              Total Invoices: {filteredRecords.length}
            </span>
          </div>

          <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-500/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs bg-blue-50/10">
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-6">Fee Item</th>
                    <th className="py-3 px-6">Amount Paid</th>
                    <th className="py-3 px-6">Outstanding</th>
                    <th className="py-3 px-6">Ref No</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 text-slate-800">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        No recorded student fee payments found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-4 px-6 font-semibold text-black">
                          <div>
                            <span>{rec.student?.name || "Student"}</span>
                            <span className="block text-[10px] text-blue-650 font-mono">
                              Adm: {rec.student?.adm_no || "N/A"} • {rec.student?.className || "Class"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-700 font-medium">
                          {rec.fee?.title || "Tuition / Fee"}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs font-bold text-emerald-700">
                          ₦{(rec.amt_paid || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-600 font-medium">
                          ₦{(rec.balance || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500">
                          {rec.ref_no || "—"}
                        </td>
                        <td className="py-4 px-6 text-xs">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              rec.paid === 1 || rec.balance === 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {rec.paid === 1 || rec.balance === 0 ? "Fully Paid" : "Partial Balance"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setSelectedReceipt(rec)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-650 transition-colors cursor-pointer"
                            title="View / Print Receipt"
                          >
                            <Receipt size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Fee Structures */}
      {activeTab === "structures" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feeStructures.map((pay) => (
            <div
              key={pay.id}
              className="bg-white border border-blue-100 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm shadow-blue-500/5 hover:border-blue-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <CreditCard size={20} />
                  </div>
                  <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                    ₦{pay.amount.toLocaleString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-black">{pay.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {pay.description || "General student fee bill."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  {pay.myClass?.name || "All Classes"}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{pay.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Record Student Payment */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-blue-100 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Receipt size={18} className="text-emerald-600" />
                <span>Record Student Fee Payment</span>
              </h3>
              <button
                onClick={() => setShowCollectModal(false)}
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

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Select Student *</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">Choose Student</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id.toString()}>
                      {st.name} ({st.adm_no || "No Adm"} - {st.className})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Fee Structure / Bill *</label>
                <select
                  required
                  value={selectedFeeId}
                  onChange={(e) => handleFeeSelect(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">Choose Fee</option>
                  {feeStructures.map((f) => (
                    <option key={f.id} value={f.id.toString()}>
                      {f.title} (₦{f.amount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Amount Paid (₦) *</label>
                  <input
                    type="number"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Remaining Balance</label>
                  <div className="w-full px-3.5 py-2 bg-slate-100 rounded-xl text-xs text-slate-700 font-mono font-bold">
                    ₦{liveBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Confirm Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create Fee Structure */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-blue-100 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" />
                <span>Create Fee Structure</span>
              </h3>
              <button
                onClick={() => setShowFeeModal(false)}
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

            <form onSubmit={handleCreateFee} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Fee Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Term Tuition Fee"
                  value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Amount (₦) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45000"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Target Class</label>
                  <select
                    value={feeClassId}
                    onChange={(e) => setFeeClassId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  placeholder="Additional details regarding this fee..."
                  value={feeDescription}
                  onChange={(e) => setFeeDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 resize-none h-16"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeeModal(false)}
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
                  <span>Save Fee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Official Printable Fee Receipt */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-blue-100 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck size={16} className="text-emerald-600" />
                <span>Payment Receipt</span>
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Inner Card */}
            <div className="border border-slate-200 p-6 rounded-2xl space-y-5 bg-gradient-to-b from-blue-50/20 to-white">
              {/* Receipt Header */}
              <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-2">
                  CJ
                </div>
                <h2 className="text-lg font-black text-black tracking-wide uppercase">
                  CJ INSPIRED ACADEMY
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Official Student Fee Payment Receipt
                </p>
                <span className="inline-block mt-1 font-mono text-xs font-bold text-blue-700">
                  Ref: {selectedReceipt.ref_no}
                </span>
              </div>

              {/* Details List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.student?.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Admission No:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedReceipt.student?.adm_no || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Class:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedReceipt.student?.className || "General"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Fee Item:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedReceipt.fee?.title || "Tuition / Fee"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Session Year:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.year}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
                  <span className="font-bold text-slate-800">Amount Paid:</span>
                  <span className="font-mono font-extrabold text-emerald-700">
                    ₦{(selectedReceipt.amt_paid || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-slate-700">
                    ₦{(selectedReceipt.balance || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-center pt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    selectedReceipt.balance === 0 || selectedReceipt.paid === 1
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedReceipt.balance === 0 || selectedReceipt.paid === 1
                    ? "Status: Paid In Full"
                    : "Status: Partial Payment"}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between print:hidden">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
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
