"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Users, TrendingUp, Clock, X, Award } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { useToast } from "../../components/ui/ToastProvider";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDateTime } from "../../utils/supabase/adminHelpers";

export default function ExamsPage() {
  const { showToast } = useToast();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // حالات خاصة بالنافذة المنبثقة (Modal) لعرض الطلاب
  const [selectedExam, setSelectedExam] = useState(null);
  const [examAttempts, setExamAttempts] = useState([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);

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

  // دالة جلب تفاصيل ومحاولات الطلاب لاختبار معين بشكل منفصل لتجنب أخطاء الـ Joins
  async function handleOpenExamDetails(exam) {
    setSelectedExam(exam);
    setIsLoadingAttempts(true);
    const supabase = createClient();

    // 1. جلب محاولات الامتحان الخاصة بهذا الاختبار فقط
    const { data: attemptsData, error: attemptsError } = await supabase
      .from("exam_attempts")
      .select("id, student_id, score, status, submitted_at")
      .eq("exam_id", exam.id)
      .in("status", ["submitted", "auto_submitted"])
      .order("score", { ascending: false });

    if (attemptsError) {
      showToast({
        type: "error",
        message: "تعذر تحميل نتائج الطلاب لهذا الاختبار.",
      });
      setExamAttempts([]);
      setIsLoadingAttempts(false);
      return;
    }

    if (!attemptsData || attemptsData.length === 0) {
      setExamAttempts([]);
      setIsLoadingAttempts(false);
      return;
    }

    // 2. استخراج معرفات الطلاب الفريدة لجلب بياناتهم دفعة واحدة
    const studentIds = [...new Set(attemptsData.map((a) => a.student_id))];

    // 3. جلب بيانات الطلاب من جدول الـ profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", studentIds);

    if (profilesError) {
      setExamAttempts(attemptsData.map((a) => ({ ...a, student: null })));
      setIsLoadingAttempts(false);
      return;
    }

    const profilesMap = new Map((profilesData ?? []).map((p) => [p.id, p]));
    const combined = attemptsData.map((attempt) => ({
      ...attempt,
      student: profilesMap.get(attempt.student_id) || null,
    }));

    setExamAttempts(combined);
    setIsLoadingAttempts(false);
  }

  async function handleDelete(e, examId) {
    e.stopPropagation();
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

    setExams((prev) => prev.filter((ex) => ex.id !== examId));
    showToast({ type: "success", message: "تم حذف الاختبار." });
  }

  function examStatusLabel(exam) {
    const now = new Date();
    if (now < new Date(exam.start_time))
      return {
        label: "لم يبدأ بعد",
        className:
          "bg-slate-100 text-slate-600 dark:bg-slate-700/50 ",
      };
    if (now > new Date(exam.end_time))
      return {
        label: "منتهي",
        className:
          "bg-slate-100 text-slate-600 dark:bg-slate-700/50 ",
      };
    return {
      label: "جارٍ الآن",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 ",
    };
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            إدارة الاختبارات
          </h1>
          <p className="mt-1 text-slate-600 ">
            إنشاء ومتابعة الاختبارات ونتائج الطلاب (اضغط على أي اختبار لعرض
            تفاصيل الطلاب)
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
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-slate-600 ">
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
                onClick={() => handleOpenExamDetails(exam)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md "
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {exam.title}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 ">
                      {exam.subject?.name ?? "—"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, exam.id)}
                    className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 "
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4 ">
                  <div className="flex items-center gap-2 text-sm text-slate-600 ">
                    <Clock size={16} />
                    {exam.duration_minutes} دقيقة
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 ">
                    <Users size={16} />
                    {exam.completedCount} طالب أنهى
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 ">
                    <TrendingUp size={16} />
                    {exam.avgScore !== null
                      ? `${exam.avgScore}% متوسط`
                      : "لا توجد نتائج"}
                  </div>
                  <div className="text-sm text-slate-500 ">
                    يبدأ {formatDateTime(exam.start_time)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* النافذة المنبثقة (Modal) لعرض الطلاب الذين أنهوا الاختبار */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 ">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  نتائج اختبار: {selectedExam.title}
                </h2>
                <p className="text-sm text-slate-500 ">
                  الطلاب الذين أتموا تسليم الاختبار بنجاح
                </p>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 "
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6">
              {isLoadingAttempts ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : examAttempts.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-300 " />
                  <p className="mt-3 text-slate-500 ">
                    لم يقم أي طالب بتسليم هذا الاختبار حتى الآن.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {examAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold">
                          {attempt.student?.full_name?.charAt(0) || "ط"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 ">
                            {attempt.student?.full_name || "طالب بدون اسم"}
                          </p>
                          <p className="text-xs text-slate-500 ">
                            {attempt.student?.phone || "—"} • تسليم في:{" "}
                            {attempt.submitted_at
                              ? formatDateTime(attempt.submitted_at)
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2">
                        <Award
                          size={18}
                          className="text-blue-600 "
                        />
                        <span className="font-bold text-slate-900 ">
                          {attempt.score ?? 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 text-left dark:border-slate-700">
              <button
                onClick={() => setSelectedExam(null)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
