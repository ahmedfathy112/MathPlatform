"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Users, TrendingUp, Clock } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { useToast } from "../../components/ui/ToastProvider";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDateTime } from "../../utils/supabase/adminHelpers";

export default function ExamsPage() {
  const { showToast } = useToast();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExams = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const [{ data: examRows, error }, { data: attemptRows }] =
      await Promise.all([
        supabase
          .from("exams")
          .select(
            "id, title, start_time, end_time, duration_minutes, subject:subject_id(name)",
          )
          .order("start_time", { ascending: false }),
        supabase
          .from("exam_attempts")
          .select("exam_id, status, score")
          .in("status", ["submitted", "auto_submitted"]),
      ]);

    if (error) {
      showToast({ type: "error", message: "تعذر تحميل الاختبارات." });
      setIsLoading(false);
      return;
    }

    const statsByExam = new Map();
    (attemptRows ?? []).forEach((row) => {
      const entry = statsByExam.get(row.exam_id) ?? { count: 0, totalScore: 0 };
      entry.count += 1;
      entry.totalScore += Number(row.score || 0);
      statsByExam.set(row.exam_id, entry);
    });

    setExams(
      (examRows ?? []).map((exam) => {
        const stats = statsByExam.get(exam.id);
        return {
          ...exam,
          completedCount: stats?.count ?? 0,
          avgScore: stats ? Math.round(stats.totalScore / stats.count) : null,
        };
      }),
    );
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  async function handleDelete(examId) {
    if (
      !window.confirm(
        "هل تريد حذف هذا الاختبار وكل أسئلته ومحاولات الطلاب فيه؟",
      )
    ) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("exams").delete().eq("id", examId);

    if (error) {
      showToast({ type: "error", message: "تعذر حذف الاختبار." });
      return;
    }

    setExams((prev) => prev.filter((e) => e.id !== examId));
    showToast({ type: "success", message: "تم حذف الاختبار." });
  }

  function examStatusLabel(exam) {
    const now = new Date();
    if (now < new Date(exam.start_time))
      return {
        label: "لم يبدأ بعد",
        className:
          "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
      };
    if (now > new Date(exam.end_time))
      return {
        label: "منتهي",
        className:
          "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
      };
    return {
      label: "جارٍ الآن",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            إدارة الاختبارات
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            إنشاء ومتابعة الاختبارات ونتائج الطلاب
          </p>
        </div>
        <Link
          href="/admin/exams/create"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          <Plus size={20} />
          اختبار جديد
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : exams.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-400">
            لا توجد اختبارات بعد. أنشئ أول اختبار.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const status = examStatusLabel(exam);
            return (
              <div
                key={exam.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {exam.title}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {exam.subject?.name ?? "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={16} />
                    {exam.duration_minutes} دقيقة
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users size={16} />
                    {exam.completedCount} طالب أنهى
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <TrendingUp size={16} />
                    {exam.avgScore !== null
                      ? `${exam.avgScore}% متوسط`
                      : "لا توجد نتائج"}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    يبدأ {formatDateTime(exam.start_time)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
