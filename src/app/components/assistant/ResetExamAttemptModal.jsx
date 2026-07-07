"use client";

import { useEffect, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { useToast } from "../../components/ui/ToastProvider";
import { formatDateTime } from "../../utils/supabase/adminHelpers";

const STATUS_LABELS = {
  in_progress: "قيد التنفيذ الآن",
  submitted: "تم التسليم",
  auto_submitted: "تم التسليم تلقائيًا",
};

/**
 * Lists a student's exam attempts and lets staff delete one, which frees
 * the unique (student_id, exam_id) constraint so the student can start a
 * fresh attempt — for when a technical issue interrupted their exam.
 */
export default function ResetExamAttemptModal({ student, onClose }) {
  const { showToast } = useToast();
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resettingId, setResettingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("exam_attempts")
        .select(
          "id, status, started_at, submitted_at, score, exam:exam_id(title)",
        )
        .eq("student_id", student.id)
        .order("started_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        showToast({ type: "error", message: "تعذر تحميل محاولات الطالب." });
      }

      setAttempts(data ?? []);
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  async function handleReset(attemptId) {
    setResettingId(attemptId);
    const supabase = createClient();

    const { error } = await supabase
      .from("exam_attempts")
      .delete()
      .eq("id", attemptId);

    setResettingId(null);

    if (error) {
      showToast({ type: "error", message: "تعذر إعادة تعيين المحاولة." });
      return;
    }

    setAttempts((prev) => prev.filter((a) => a.id !== attemptId));
    showToast({
      type: "success",
      message: "تم حذف المحاولة، يمكن للطالب البدء من جديد.",
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/95 p-6 backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              إعادة محاولة الامتحان
            </h2>
            <p className="mt-1 text-sm text-slate-400">{student.full_name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-full bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 max-h-96 space-y-3 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-slate-400">جارٍ التحميل...</p>
          ) : attempts.length === 0 ? (
            <p className="rounded-2xl bg-white/5 p-4 text-sm text-slate-400">
              لا توجد محاولات اختبار لهذا الطالب.
            </p>
          ) : (
            attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {attempt.exam?.title ?? "اختبار"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {STATUS_LABELS[attempt.status] ?? attempt.status} •{" "}
                    {formatDateTime(attempt.started_at)}
                    {attempt.score !== null
                      ? ` • النتيجة: ${attempt.score}%`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleReset(attempt.id)}
                  disabled={resettingId === attempt.id}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-300 transition-all duration-300 hover:bg-violet-500/25 hover:shadow-[0_0_14px_rgba(139,92,246,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  إعادة تعيين
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
