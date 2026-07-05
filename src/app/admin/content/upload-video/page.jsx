"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link2, Loader2, UploadCloud } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import { useToast } from "../../../components/ui/ToastProvider";
import { GRADE_LABELS } from "../../../utils/supabase/adminHelpers";

const videoSchema = z.object({
  subjectId: z.string().min(1, "يرجى اختيار المادة"),
  title: z.string().trim().min(3, "يرجى إدخال عنوان الدرس"),
  description: z.string().optional(),
  videoUrl: z
    .string()
    .trim()
    .min(5, "يرجى إدخال رابط الفيديو")
    .url("يرجى إدخال رابط صحيح"),
});

export default function UploadVideoPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(videoSchema),
    defaultValues: { subjectId: "", title: "", description: "", videoUrl: "" },
  });

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

  const onSubmit = async ({ subjectId, title, description, videoUrl }) => {
    const supabase = createClient();

    const { error } = await supabase.from("videos").insert({
      subject_id: subjectId,
      title,
      description: description?.trim() || null,
      video_url: videoUrl,
      created_by: process.env.NEXT_PUBLIC_SUPABASE_TEACHER,
    });

    if (error) {
      showToast({ type: "error", message: "تعذر رفع الفيديو." });
      return;
    }

    showToast({ type: "success", message: "تم إضافة الفيديو بنجاح." });
    reset();
    router.push("/admin/courses");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          إضافة فيديو جديد
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          أضف رابط فيديو خارجي (مثل Bunny.net) إلى إحدى المواد الدراسية.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            المادة الدراسية
          </label>
          <select
            {...register("subjectId")}
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
          {errors.subjectId ? (
            <p className="mt-1 text-sm text-rose-600">
              {errors.subjectId.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            عنوان الدرس
          </label>
          <input
            {...register("title")}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder="مثال: مقدمة في المعادلات التربيعية"
          />
          {errors.title ? (
            <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            وصف الدرس (اختياري)
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            رابط الفيديو
          </label>
          <div className="relative mt-2">
            <Link2
              size={18}
              className="pointer-events-none absolute inset-y-0 right-4 my-auto text-slate-400"
            />
            <input
              {...register("videoUrl")}
              dir="ltr"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="https://iframe.mediadelivery.net/embed/..."
            />
          </div>
          {errors.videoUrl ? (
            <p className="mt-1 text-sm text-rose-600">
              {errors.videoUrl.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <UploadCloud size={18} />
          )}
          {isSubmitting ? "جارٍ الحفظ..." : "حفظ الفيديو"}
        </button>
      </form>
    </div>
  );
}
