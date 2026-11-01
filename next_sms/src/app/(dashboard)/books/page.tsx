import React from "react";
import { prisma } from "@/lib/prisma";
import { BookOpen, BookmarkCheck, Library, School } from "lucide-react";

export default async function BooksPage() {
  const books = await prisma.books.findMany({ orderBy: { id: "asc" } });
  const classes = await prisma.my_classes.findMany();

  const booksList = books.map((b) => {
    const myClass = classes.find((c) => c.id === b.my_class_id);
    return {
      ...b,
      myClass,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Library & Textbooks</h2>
          <p className="text-xs text-slate-600">
            Catalog of school library books, assigned classes, and inventory counts.
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-650 border border-blue-100">
            Total Books: {booksList.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {booksList.map((book) => (
          <div
            key={book.id}
            className="bg-white border border-blue-100 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm shadow-blue-500/5 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Library size={20} />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-black truncate">{book.name}</h3>
                <p className="text-xs text-slate-500">
                  Author: <span className="font-medium text-slate-700">{book.author || "Unknown"}</span>
                </p>
                {book.location && (
                  <span className="inline-flex mt-1 px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-800 uppercase font-mono">
                    Shelf: {book.location}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <School size={14} className="text-slate-400" />
                <span>Class: <strong>{book.myClass?.name || "All"}</strong></span>
              </div>
              <span className="font-semibold text-slate-700 font-mono">
                Copies: {book.issued_copies || 0} / {book.total_copies || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
