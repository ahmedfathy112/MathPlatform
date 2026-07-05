import Link from "next/link";
import { ArrowLeft, BookOpen, Clock3 } from "lucide-react";

const STATUS_PRESETS = {
  active: {
    badgeLabel: "نشط",
    badgeClassName: "bg-emerald-100 text-emerald-700",
    actionLabel: "دخول للمادة",
    buttonClassName: "bg-blue-600 text-white hover:bg-blue-700",
  },
  pending: {
    badgeLabel: "قيد المراجعة",
    badgeClassName: "bg-amber-100 text-amber-700",
    actionLabel: "طلبك قيد المراجعة",
    buttonClassName: "bg-slate-200 text-slate-500",
  },
  suspended: {
    badgeLabel: "موقوف",
    badgeClassName: "bg-rose-100 text-rose-700",
    actionLabel: "تواصل مع الدعم",
    buttonClassName: "bg-slate-200 text-slate-500",
  },
  expired: {
    badgeLabel: "منتهي",
    badgeClassName: "bg-slate-200 text-slate-600",
    actionLabel: "تجديد الاشتراك",
    buttonClassName: "bg-blue-600 text-white hover:bg-blue-700",
  },
  none: {
    badgeLabel: "غير مشترك",
    badgeClassName: "bg-slate-100 text-slate-600",
    actionLabel: "اشترك الآن",
    buttonClassName: "bg-blue-600 text-white hover:bg-blue-700",
  },
};

/**
 * Renders one subject as a subscribable/enterable card. `status` should be
 * one of the `subscription_status` enum values, or `null`/`undefined` if the
 * student has never subscribed to this subject at all.
 */
export default function PackageCard({
  subjectId,
  title,
  description,
  status,
  gradeLabel,
}) {
  const preset = STATUS_PRESETS[status] ?? STATUS_PRESETS.none;
  const isActive = status === "active";
  const isClickable = status !== "pending" && status !== "suspended";
  const href = isActive
    ? `/dashboard/classes/${subjectId}`
    : `/dashboard/subscriptions/${subjectId}`;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 text-white">
        <div className="text-center">
          <BookOpen size={28} className="mx-auto mb-2" />
          <p className="text-sm font-semibold">{gradeLabel ?? title}</p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${preset.badgeClassName}`}
          >
            {preset.badgeLabel}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Clock3 size={16} />
          <span>{description || "تحديثات منتظمة وشرح مبسط"}</span>
        </div>

        {isClickable ? (
          <Link
            href={href}
            className={`mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${preset.buttonClassName}`}
          >
            {preset.actionLabel}
            <ArrowLeft size={16} />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className={`mt-5 inline-flex cursor-not-allowed items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ${preset.buttonClassName}`}
          >
            {preset.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
