"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Key,
  Plus,
  Search,
  CheckCircle,
  HelpCircle,
  Loader2,
  X,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

interface PinItem {
  id: number;
  code: string;
  used: string;
  times_used: string;
  user_id: number | null;
  student_id: number | null;
  studentUser?: { id: number; name: string } | null;
}

interface Props {
  initialPins: PinItem[];
  userRole: string;
}

export default function PinManager({ initialPins, userRole }: Props) {
  const router = useRouter();
  const canGenerate = userRole === "super_admin" || userRole === "admin";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unused" | "used">("all");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCount, setGenerateCount] = useState("10");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredPins = useMemo(() => {
    return initialPins.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        (p.studentUser?.name && p.studentUser.name.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "used" && p.used === "1") ||
        (statusFilter === "unused" && p.used === "0");

      return matchesSearch && matchesStatus;
    });
  }, [initialPins, search, statusFilter]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: generateCount }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          setShowGenerateModal(false);
          setSuccess(null);
          router.refresh();
        }, 1000);
      } else {
        setError(data.error || "Failed to generate PINs.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Scratch Cards & PINs</h2>
          <p className="text-xs text-slate-600">
            Generate and manage access PIN codes used by parents and students to unlock terminal report cards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            Total Displayed: {filteredPins.length}
          </span>
          {canGenerate && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Generate Batch PINs</span>
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
            placeholder="Search by PIN code or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs text-slate-800 outline-none transition-all font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("unused")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "unused"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-blue-700"
            }`}
          >
            Unused
          </button>
          <button
            onClick={() => setStatusFilter("used")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "used"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            Used
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm shadow-blue-550/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-blue-50 text-slate-500 font-medium text-xs bg-blue-50/10">
                <th className="py-3 px-6">PIN Code</th>
                <th className="py-3 px-6">Usage Status</th>
                <th className="py-3 px-6">Times Used</th>
                <th className="py-3 px-6">Assigned / Used By</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-slate-800">
              {filteredPins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    No matching scratch card PINs found.
                  </td>
                </tr>
              ) : (
                filteredPins.map((pin) => (
                  <tr key={pin.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-blue-700">
                      <span className="flex items-center gap-2">
                        <Key size={14} className="text-blue-500" />
                        {pin.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium">
                      {pin.used === "1" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle size={12} /> Used
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                          <HelpCircle size={12} /> Unused
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-slate-700">
                      {pin.times_used} time(s)
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-800 font-semibold">
                      {pin.studentUser?.name || "—"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleCopy(pin.code)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer inline-flex items-center gap-1 text-xs"
                        title="Copy PIN Code"
                      >
                        {copiedCode === pin.code ? (
                          <>
                            <Check size={14} className="text-emerald-600" />
                            <span className="text-[10px] text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate Batch PINs */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-blue-100 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Key size={18} className="text-blue-600" />
                <span>Generate Batch PINs</span>
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
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

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Quantity to Generate</label>
                <select
                  value={generateCount}
                  onChange={(e) => setGenerateCount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 font-bold"
                >
                  <option value="10">10 Scratch Cards</option>
                  <option value="25">25 Scratch Cards</option>
                  <option value="50">50 Scratch Cards</option>
                  <option value="100">100 Scratch Cards</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Each PIN will be generated in secure format (e.g. <code>CJ-XXXX-XXXX-XXXX</code>).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
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
                  <span>Generate Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
