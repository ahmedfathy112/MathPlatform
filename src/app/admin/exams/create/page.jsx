"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import { useToast } from "../../../components/ui/ToastProvider";
import { GRADE_LABELS } from "../../../utils/supabase/adminHelpers";

const OPTION_KEYS = ["A", "B", "C", "D"];

function makeEmptyQuestion() {
  return {
    clientId: crypto.randomUUID(),
    imageFile: null,
    imagePreviewUrl: null,
    options: { A: "", B: "", C: "", D: "" },
    correctOption: "A",
  };
}

export default function CreateExamPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [examForm, setExamForm] = useState({
    subjectId: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    durationMinutes: "30",
  });
  const [questions, setQuestions] = useState([makeEmptyQuestion()]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRefs = useRef({});

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoadingSubjects(true);
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, grade_level")
        .order("name");

      if (cancelled) return;

      if (error) {
        showToast({ type: "error", message: "تعذر تحميل قائمة المواد." });
      }

      setSubjects(data ?? []);
      setIsLoadingSubjects(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateExamField(field) {
    return (event) => {
      setExamForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function updateQuestionOption(clientId, optionKey, value) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.clientId === clientId
          ? { ...q, options: { ...q.options, [optionKey]: value } }
          : q,
      ),
    );
  }

  function updateQuestionCorrectOption(clientId, value) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.clientId === clientId ? { ...q, correctOption: value } : q,
      ),
    );
  }

  function handleImageSelect(clientId, file) {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setQuestions((prev) =>
      prev.map((q) =>
        q.clientId === clientId
          ? { ...q, imageFile: file, imagePreviewUrl: previewUrl }
          : q,
      ),
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, makeEmptyQuestion()]);
  }

  function removeQuestion(clientId) {
    setQuestions((prev) => prev.filter((q) => q.clientId !== clientId));
  }

  function validate() {
    if (!examForm.subjectId) return "يرجى اختيار المادة";
    if (!examForm.title.trim()) return "يرجى إدخال عنوان الاختبار";
    if (!examForm.startTime || !examForm.endTime)
      return "يرجى تحديد وقت البدء والانتهاء";
    if (new Date(examForm.endTime) <= new Date(examForm.startTime)) {
      return "يجب أن يكون وقت الانتهاء بعد وقت البدء";
    }
    if (!examForm.durationMinutes || Number(examForm.durationMinutes) <= 0) {
      return "يرجى إدخال مدة صحيحة بالدقائق";
    }
    if (questions.length === 0) return "أضف سؤالًا واحدًا على الأقل";

    for (const [index, question] of questions.entries()) {
      if (!question.imageFile) return `السؤال ${index + 1}: يرجى رفع صورة`;
      const filledOptions = OPTION_KEYS.filter((key) =>
        question.options[key].trim(),
      );
      if (filledOptions.length < 2) {
        return `السؤال ${index + 1}: أدخل خيارين على الأقل`;
      }
      if (!question.options[question.correctOption].trim()) {
        return `السؤال ${index + 1}: الإجابة الصحيحة المحددة فارغة`;
      }
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      showToast({ type: "error", message: validationError });
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .insert({
        subject_id: examForm.subjectId,
        title: examForm.title.trim(),
        description: examForm.description.trim() || null,
        start_time: new Date(examForm.startTime).toISOString(),
        end_time: new Date(examForm.endTime).toISOString(),
        duration_minutes: Number(examForm.durationMinutes),
        created_by: process.env.NEXT_PUBLIC_SUPABASE_TEACHER,
      })
      .select("id")
      .single();

    if (examError || !exam) {
      showToast({ type: "error", message: "تعذر إنشاء الاختبار." });
      setIsSaving(false);
      return;
    }

    let uploadFailures = 0;

    for (const [index, question] of questions.entries()) {
      const fileExt = question.imageFile.name.split(".").pop();
      const storagePath = `${exam.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("question-images")
        .upload(storagePath, question.imageFile);

      if (uploadError) {
        uploadFailures += 1;
        continue;
      }

      const trimmedOptions = Object.fromEntries(
        OPTION_KEYS.filter((key) => question.options[key].trim()).map((key) => [
          key,
          question.options[key].trim(),
        ]),
      );

      const { error: questionError } = await supabase.from("questions").insert({
        exam_id: exam.id,
        image_url: storagePath,
        options: trimmedOptions,
        correct_option: question.correctOption,
        order_index: index,
      });

      if (questionError) {
        uploadFailures += 1;
      }
    }

    setIsSaving(false);

    if (uploadFailures > 0) {
      showToast({
        type: "error",
        message: `تم إنشاء الاختبار لكن فشل حفظ ${uploadFailures} سؤال. يمكنك حذف الاختبار وإعادة المحاولة.`,
      });
      return;
    }

    showToast({ type: "success", message: "تم إنشاء الاختبار بنجاح." });
    router.push("/admin/exams");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          اختبار جديد
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          كل سؤال يحتاج صورة (للمسألة الرياضية) وخيارات نصية والإجابة الصحيحة.
        </p>
      </div>

      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          بيانات الاختبار
        </h2>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            المادة
          </label>
          <select
            value={examForm.subjectId}
            onChange={updateExamField("subjectId")}
            disabled={isLoadingSubjects}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">
              {isLoadingSubjects ? "جارٍ التحميل..." : "اختر المادة"}
            </option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} —{" "}
                {GRADE_LABELS[subject.grade_level] ?? subject.grade_level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            عنوان الاختبار
          </label>
          <input
            value={examForm.title}
            onChange={updateExamField("title")}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder="مثال: اختبار الوحدة الأولى"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            وصف (اختياري)
          </label>
          <textarea
            value={examForm.description}
            onChange={updateExamField("description")}
            rows={2}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              وقت البدء
            </label>
            <input
              type="datetime-local"
              value={examForm.startTime}
              onChange={updateExamField("startTime")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              وقت الانتهاء
            </label>
            <input
              type="datetime-local"
              value={examForm.endTime}
              onChange={updateExamField("endTime")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              المدة (دقيقة)
            </label>
            <input
              type="number"
              value={examForm.durationMinutes}
              onChange={updateExamField("durationMinutes")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            الأسئلة ({questions.length})
          </h2>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <Plus size={16} /> إضافة سؤال
          </button>
        </div>

        {questions.map((question, index) => (
          <div
            key={question.clientId}
            className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                السؤال {index + 1}
              </p>
              {questions.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeQuestion(question.clientId)}
                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={16} />
                </button>
              ) : null}
            </div>

            <div>
              <input
                ref={(el) => {
                  fileInputRefs.current[question.clientId] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  handleImageSelect(question.clientId, event.target.files?.[0])
                }
              />
              {question.imagePreviewUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={question.imagePreviewUrl}
                    alt={`معاينة السؤال ${index + 1}`}
                    className="w-full rounded-2xl border border-slate-200 object-contain dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRefs.current[question.clientId]?.click()
                    }
                    className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur hover:bg-white"
                  >
                    <ImagePlus size={14} /> تغيير الصورة
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    fileInputRefs.current[question.clientId]?.click()
                  }
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 text-slate-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                >
                  <ImagePlus size={28} />
                  <span className="text-sm font-medium">ارفع صورة السؤال</span>
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {OPTION_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <input
                      type="radio"
                      name={`correct-${question.clientId}`}
                      checked={question.correctOption === key}
                      onChange={() =>
                        updateQuestionCorrectOption(question.clientId, key)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    {key}
                  </label>
                  <input
                    value={question.options[key]}
                    onChange={(event) =>
                      updateQuestionOption(
                        question.clientId,
                        key,
                        event.target.value,
                      )
                    }
                    placeholder={`الخيار ${key}`}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              حدد الدائرة بجانب الإجابة الصحيحة.
            </p>
          </div>
        ))}
      </section>

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Save size={18} />
        )}
        {isSaving ? "جارٍ الحفظ..." : "حفظ الاختبار"}
      </button>
    </form>
  );
}
