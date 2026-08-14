"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock3, CheckCircle2, PlayCircle } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { useAuthStore, selectUser } from "../../store/useAuthStore";
import { useToast } from "../../components/ui/ToastProvider";
import { Skeleton } from "../../components/ui/Skeleton";

const ATTEMPT_LABELS = {
  not_started: {
    label: "لم تبدأ بعد",
    className: "bg-slate-100 text-slate-600",
  },
  in_progress: { label: "قيد التنفيذ", className: "bg-blue-100 text-blue-700" },
  submitted: {
    label: "تم التسليم",
    className: "bg-emerald-100 text-emerald-700",
  },
  auto_submitted: {
    label: "تم التسليم تلقائيًا",
    className: "bg-amber-100 text-amber-700",
  },
};

function formatExamDateTime(isoString) {
  return new Date(isoString).toLocaleString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UpcomingExamsPage() {
  const user = useAuthStore(selectUser);
  const { showToast } = useToast();

  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isPageLoading = isLoading || !user?.id;

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);

      const { data: subscriptionRows, error: subsError } = await supabase
        .from("subscriptions")
        .select("package_id, status, expires_at")
        .eq("student_id", user.id)
        .eq("status", "active");

      if (cancelled) return;

      if (subsError) {
        showToast({
          type: "error",
          message: "تعذر تحميل بياناتك. حاول مرة أخرى.",
        });
        setIsLoading(false);
        return;
      }

      const activePackageIds = (subscriptionRows ?? [])
        .filter(
          (sub) => !sub.expires_at || new Date(sub.expires_at) > new Date(),
        )
        .map((sub) => sub.package_id);

      if (activePackageIds.length === 0) {
        setExams([]);
        setIsLoading(false);
        return;
      }

      const { data: subjectRows } = await supabase
        .from("subjects")
        .select("id, name, package_id")
        .in("package_id", activePackageIds);

      if (cancelled) return;

      const subjectIds = (subjectRows ?? []).map((s) => s.id);
      if (subjectIds.length === 0) {
        setExams([]);
        setIsLoading(false);
        return;
      }

      const { data: examRows, error: examsError } = await supabase
        .from("exams")
        .select("id, title, subject_id, start_time, end_time, duration_minutes")
        .in("subject_id", subjectIds)
        .gt("end_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      if (cancelled) return;

      if (examsError) {
        showToast({ type: "error", message: "تعذر تحميل الاختبارات القادمة." });
        setIsLoading(false);
        return;
      }

      const examIds = (examRows ?? []).map((e) => e.id);

      const { data: attemptRows } = examIds.length
        ? await supabase
            .from("exam_attempts")
            .select("exam_id, status, score")
            .eq("student_id", user.id)
            .in("exam_id", examIds)
        : { data: [] };

      if (cancelled) return;

      const subjectById = new Map((subjectRows ?? []).map((s) => [s.id, s]));
      const attemptByExamId = new Map(
        (attemptRows ?? []).map((a) => [a.exam_id, a]),
      );

      setExams(
        (examRows ?? []).map((exam) => ({
          ...exam,
          subject: subjectById.get(exam.subject_id) ?? null,
          attempt: attemptByExamId.get(exam.id) ?? null,
        })),
      );
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">
          جدول الامتحانات
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          كل الاختبارات القادمة في المواد التي اشتركت بها
        </p>
      </div>

      {isPageLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-600">
              جارٍ تحميل الاختبارات...
            </p>
          </div>
          <Skeleton className="h-28 w-full rounded-[28px]" />
          <Skeleton className="h-28 w-full rounded-[28px]" />
          <Skeleton className="h-28 w-full rounded-[28px]" />
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-4xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <CalendarDays className="mx-auto text-slate-300" size={32} />
          <p className="mt-4 text-sm text-slate-600">
            لا توجد اختبارات قادمة في باقاتك الحالية.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const attemptStatus = exam.attempt?.status ?? "not_started";
            const statusInfo =
              ATTEMPT_LABELS[attemptStatus] ?? ATTEMPT_LABELS.not_started;
            const isLive =
              new Date(exam.start_time) <= new Date() &&
              new Date(exam.end_time) > new Date();

            const actionLabel =
              attemptStatus === "submitted" ||
              attemptStatus === "auto_submitted"
                ? "عرض النتيجة"
                : attemptStatus === "in_progress"
                  ? "متابعة الاختبار"
                  : "بدء الاختبار";

            const href = exam.subject
              ? `/dashboard/classes/${exam.subject.package_id}/${exam.subject.id}/exams/${exam.id}`
              : null;

            return (
              <div
                key={exam.id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      {exam.subject?.name ?? "مادة"}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                      {exam.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} />
                        {formatExamDateTime(exam.start_time)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 size={15} />
                        {exam.duration_minutes} دقيقة
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
                    >
                      {attemptStatus === "submitted" ||
                      attemptStatus === "auto_submitted" ? (
                        <CheckCircle2 size={12} />
                      ) : null}
                      {statusInfo.label}
                      {exam.attempt?.score != null
                        ? ` — ${exam.attempt.score}%`
                        : ""}
                    </span>
                    {isLive && attemptStatus === "not_started" ? (
                      <span className="text-xs font-semibold text-rose-600">
                        الاختبار مفتوح الآن
                      </span>
                    ) : null}
                  </div>
                </div>

                {href ? (
                  <Link
                    href={href}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <PlayCircle size={16} />
                    {actionLabel}
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
