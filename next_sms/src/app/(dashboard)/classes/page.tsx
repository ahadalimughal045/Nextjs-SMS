import React from "react";
import { prisma } from "@/lib/prisma";
import { School, Award } from "lucide-react";

export default async function ClassesPage() {
  const classes = await prisma.my_classes.findMany();
  const classTypes = await prisma.class_types.findMany();

  const classesList = classes.map((cls) => {
    const type = classTypes.find((t) => t.id === cls.class_type_id);
    return {
      ...cls,
      type,
    };
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-black">Classes & Sections</h2>
        <p className="text-xs text-slate-600">
          List of classes configured in the school management system.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classesList.map((cls) => (
          <div key={cls.id} className="bg-white border border-blue-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm shadow-blue-550/5 hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <School size={20} />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="text-sm font-bold text-black">{cls.name}</h3>
              <p className="text-xs text-slate-500 font-medium">
                Class Type: <span className="text-blue-650">{cls.type?.name || "N/A"}</span>
              </p>
              {cls.type?.code && (
                <span className="inline-flex mt-2 px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-800 uppercase">
                  Code: {cls.type.code}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
