"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "../../../../../utils/supabase/client";
import { useAuthStore, selectUser } from "../../../../../store/useAuthStore";
import { useToast } from "../../../../../components/ui/ToastProvider";
import { Skeleton } from "../../../../../components/ui/Skeleton";

const OPTION_KEYS = ["A", "B", "C", "D"];

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCountdown(totalSeconds) {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Simple wrapper for the various "can't take this exam right now" states. */
function InfoState({ icon: Icon, title, description, backHref }) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Icon size={24} />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
      {backHref ? (
        <Link
          href={backHref}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          العودة إلى المادة
        </Link>
      ) : null}
    </div>
  );
}

function ResultState({ result, examTitle, backHref }) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={24} />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">
        تم تسليم الامتحان: {examTitle}
      </h2>
      <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">النتيجة</p>
          <p className="mt-2 text-xl font-semibold text-blue-600">
            {result?.score ?? "—"}%
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">صحيحة</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {result?.correct_answers ?? "—"}
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">الإجمالي</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {result?.total_questions ?? "—"}
          </p>
        </div>
      </div>
      <Link
        href={backHref}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        العودة إلى المادة
      </Link>
    </div>
  );
}

export default function ExamPage({ params }) {
  const resolvedParams = use(params);
  const { classId: subjectId, examId } = resolvedParams;
  const user = useAuthStore(selectUser);
  const { showToast } = useToast();
  const backHref = `/dashboard/classes/${subjectId}`;

  const [phase, setPhase] = useState("loading"); // loading | not_found | not_open_yet | closed | ready | in_progress | submitted
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: "A" | "B" | "C" | "D" }
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const deadlineRef = useRef(null);
  const hasFinalizedRef = useRef(false);

  const loadExamAndAttempt = useCallback(async () => {
    if (!user?.id || !examId) return;

    const { data: examRow, error: examError } = await supabase
      .from("exams")
      .select("id, subject_id, title, start_time, end_time, duration_minutes")
      .eq("id", examId)
      .maybeSingle();

    if (examError || !examRow) {
      setPhase("not_found");
      return;
    }
    setExam(examRow);

    const now = new Date();
    const startTime = new Date(examRow.start_time);
    const endTime = new Date(examRow.end_time);

    const { data: attemptRow } = await supabase
      .from("exam_attempts")
      .select("id, status, started_at, submitted_at, score")
      .eq("student_id", user.id)
      .eq("exam_id", examId)
      .maybeSingle();

    if (
      attemptRow?.status === "submitted" ||
      attemptRow?.status === "auto_submitted"
    ) {
      setAttempt(attemptRow);
      setResult({
        score: attemptRow.score,
        total_questions: null,
        correct_answers: null,
      });
      setPhase("submitted");
      return;
    }

    if (attemptRow?.status === "in_progress") {
      setAttempt(attemptRow);
      // Resume: figure out the real deadline and load questions immediately.
      const attemptDeadline = new Date(
        new Date(attemptRow.started_at).getTime() +
          examRow.duration_minutes * 60 * 1000,
      );
      deadlineRef.current =
        attemptDeadline < endTime ? attemptDeadline : endTime;
      setPhase("in_progress");
      return;
    }

    if (now < startTime) {
      setPhase("not_open_yet");
      return;
    }

    if (now > endTime) {
      setPhase("closed");
      return;
    }

    setPhase("ready");
  }, [user?.id, examId, supabase]);

  useEffect(() => {
    loadExamAndAttempt();
  }, [loadExamAndAttempt]);

  // Load questions + any previously saved answers once we're in progress.
  useEffect(() => {
    if (phase !== "in_progress" || !attempt?.id) return;
    let cancelled = false;

    async function loadQuestions() {
      // Query the student-safe view — it never exposes correct_option, and
      // RLS on the underlying table only allows rows while this attempt is
      // in_progress and the exam window is open. `image_url` here is a
      // private Storage path (e.g. "examId/uuid.png"), not a public URL, so
      // we resolve each one into a short-lived signed URL — RLS on
      // storage.objects is what actually gates who's allowed to generate
      // that signed URL in the first place.
      const { data: questionRows } = await supabase
        .from("questions_for_students")
        .select("id, image_url, options, order_index")
        .eq("exam_id", examId)
        .order("order_index");

      if (cancelled) return;

      const questionsWithSignedUrls = await Promise.all(
        (questionRows ?? []).map(async (question) => {
          const { data: signedUrlData } = await supabase.storage
            .from("question-images")
            .createSignedUrl(question.image_url, 3600);
          return { ...question, imageUrl: signedUrlData?.signedUrl ?? null };
        }),
      );

      if (cancelled) return;
      setQuestions(questionsWithSignedUrls);

      const { data: answerRows } = await supabase
        .from("exam_answers")
        .select("question_id, selected_option")
        .eq("attempt_id", attempt.id);

      if (cancelled) return;
      const answerMap = {};
      (answerRows ?? []).forEach((row) => {
        answerMap[row.question_id] = row.selected_option;
      });
      setAnswers(answerMap);
    }

    loadQuestions();
    return () => {
      cancelled = true;
    };
  }, [phase, attempt?.id, examId, supabase]);

  const finalizeExam = useCallback(async () => {
    if (!attempt?.id || hasFinalizedRef.current) return;
    hasFinalizedRef.current = true;
    setIsSubmitting(true);

    const { data, error } = await supabase.rpc("submit_exam", {
      p_attempt_id: attempt.id,
    });

    setIsSubmitting(false);

    if (error) {
      showToast({
        type: "error",
        message: "تعذر تسليم الامتحان. حاول مرة أخرى.",
      });
      hasFinalizedRef.current = false;
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    setResult(row ?? null);
    setPhase("submitted");
  }, [attempt?.id, supabase, showToast]);

  // Countdown ticking + auto-submit when time runs out.
  useEffect(() => {
    if (phase !== "in_progress" || !deadlineRef.current) return;

    const tick = () => {
      const secondsLeft = (deadlineRef.current.getTime() - Date.now()) / 1000;
      setRemainingSeconds(secondsLeft);
      if (secondsLeft <= 0) {
        finalizeExam();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, finalizeExam]);

  async function handleStartExam() {
    const { data: newAttempt, error } = await supabase
      .from("exam_attempts")
      .insert({ student_id: user.id, exam_id: examId })
      .select("id, status, started_at, submitted_at, score")
      .single();

    if (error) {
      showToast({
        type: "error",
        message:
          "تعذر بدء الامتحان. تأكد أن اشتراكك فعّال وأن موعد الامتحان لم ينتهِ.",
      });
      return;
    }

    setAttempt(newAttempt);
    const attemptDeadline = new Date(
      new Date(newAttempt.started_at).getTime() +
        exam.duration_minutes * 60 * 1000,
    );
    const examEnd = new Date(exam.end_time);
    deadlineRef.current = attemptDeadline < examEnd ? attemptDeadline : examEnd;
    setPhase("in_progress");
  }

  async function handleSelectOption(questionId, optionKey) {
    // Optimistic UI update — we don't surface the returned correctness here
    // on purpose, to avoid giving away answers mid-exam.
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));

    const { error } = await supabase.rpc("submit_exam_answer", {
      p_attempt_id: attempt.id,
      p_question_id: questionId,
      p_selected_option: optionKey,
    });

    if (error) {
      showToast({
        type: "error",
        message: "تعذر حفظ إجابتك، حاول اختيارها مرة أخرى.",
      });
    }
  }

  if (phase === "loading") {
    return (
      <div className="space-y-8">
        <Skeleton className="h-40 w-full rounded-[32px]" />
        <Skeleton className="h-56 w-full rounded-[32px]" />
      </div>
    );
  }

  if (phase === "not_found") {
    return (
      <InfoState
        icon={Lock}
        title="هذا الامتحان غير متاح"
        description="إما أن الامتحان غير موجود، أو أنك لا تملك اشتراكًا فعّالًا في هذه المادة."
        backHref={backHref}
      />
    );
  }

  if (phase === "not_open_yet") {
    return (
      <InfoState
        icon={Clock3}
        title="لم يبدأ الامتحان بعد"
        description={`سيبدأ هذا الامتحان في ${formatDateTime(exam.start_time)}. عد إلى هذه الصفحة عند بدء الموعد.`}
        backHref={backHref}
      />
    );
  }

  if (phase === "closed") {
    return (
      <InfoState
        icon={AlertTriangle}
        title="انتهى وقت هذا الامتحان"
        description="لم يتم تسجيل أي محاولة لك قبل انتهاء الموعد المحدد."
        backHref={backHref}
      />
    );
  }

  if (phase === "submitted") {
    return (
      <ResultState
        result={result}
        examTitle={exam?.title}
        backHref={backHref}
      />
    );
  }

  if (phase === "ready") {
    return (
      <div className="space-y-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
                اختبار
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">
                {exam.title}
              </h1>
            </div>
            <div className="rounded-[28px] bg-slate-50 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <ShieldCheck size={20} />
                <span className="text-sm font-semibold">آمن ومحدد بوقت</span>
              </div>
              <div className="mt-5 rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">المدة</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {exam.duration_minutes} دقيقة
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm leading-6 text-slate-600">
            بمجرد الضغط على "بدء الامتحان الآن"، سيبدأ العد التنازلي فورًا ولن
            يمكن إيقافه. لن تتمكن من إعادة المحاولة بعد التسليم.
          </p>
          <button
            onClick={handleStartExam}
            className="mt-6 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            بدء الامتحان الآن
          </button>
        </div>
      </div>
    );
  }

  // phase === "in_progress"
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div>
          <p className="text-sm text-slate-500">{exam.title}</p>
          <p className="text-xs text-slate-400">
            {answeredCount} من {questions.length} تمت الإجابة عنها
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-lg font-semibold ${
            remainingSeconds < 60
              ? "bg-rose-50 text-rose-600"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          <Clock3 size={18} />
          {formatCountdown(remainingSeconds)}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">
              السؤال {index + 1}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.imageUrl}
              alt={`سؤال ${index + 1}`}
              className="w-full rounded-2xl border border-slate-100"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {OPTION_KEYS.filter((key) => question.options?.[key]).map(
                (key) => {
                  const isSelected = answers[question.id] === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectOption(question.id, key)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-right text-sm font-medium transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-500"
                        }`}
                      >
                        {key}
                      </span>
                      <span>{question.options[key]}</span>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={finalizeExam}
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isSubmitting ? "جارٍ التسليم..." : "تسليم الامتحان"}
      </button>
    </div>
  );
}
