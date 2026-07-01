import Link from "next/link";
import { ArrowLeft, BookOpen, Clock3 } from "lucide-react";

export default function PackageCard({ title, status, imagePlaceholder, actionLabel }) {
  const isActive = status === "active";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 text-white">
        <div className="text-center">
          <BookOpen size={28} className="mx-auto mb-2" />
          <p className="text-sm font-semibold">{imagePlaceholder}</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {isActive ? "نشط" : "قيد المراجعة"}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Clock3 size={16} />
          <span>تحديثات منتظمة وشرح مبسط</span>
        </div>

        {isActive ? (
          <Link
            href="/dashboard/classes/1"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {actionLabel || "دخول للمادة"}
            <ArrowLeft size={16} />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-5 inline-flex cursor-not-allowed items-center gap-2 rounded-2xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
          >
            {actionLabel || "في انتظار المراجعة"}
          </button>
        )}
      </div>
    </div>
  );
}
