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
import { useAuthStore, selectProfile } from "../../../store/useAuthStore";

const videoSchema = z.object({
  packageId: z.string().min(1, "يرجى اختيار السنة الدراسية"),
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
  const profile = useAuthStore(selectProfile);

  const [packages, setPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      packageId: "",
      subjectId: "",
      title: "",
      description: "",
      videoUrl: "",
    },
  });

  const selectedPackageId = watch("packageId");

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoadingPackages(true);
      const { data, error } = await supabase
        .from("packages")
        .select("id, name, grade_level")
        .eq("is_active", true)
        .order("name");

      if (cancelled) return;

      if (error) {
        showToast({
          type: "error",
          message: "تعذر تحميل قائمة السنوات الدراسية.",
        });
      }

      setPackages(data ?? []);
      setIsLoadingPackages(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reset the subject choice whenever the package changes, so a subject
    // from the previously selected year can never be submitted by mistake.
    setValue("subjectId", "");

    if (!selectedPackageId) {
      setSubjects([]);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoadingSubjects(true);
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("package_id", selectedPackageId)
        .eq("is_active", true)
        .order("name");

      if (cancelled) return;

      if (error) {
        showToast({
          type: "error",
          message: "تعذر تحميل مواد هذه السنة الدراسية.",
        });
      }

      setSubjects(data ?? []);
      setIsLoadingSubjects(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedPackageId]);

  const onSubmit = async ({ subjectId, title, description, videoUrl }) => {
    const supabase = createClient();

    const { error } = await supabase.from("videos").insert({
      subject_id: subjectId,
      title,
      description: description?.trim() || null,
      video_url: videoUrl,
      created_by: profile.id,
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
        <h1 className="text-3xl font-bold text-slate-900">إضافة فيديو جديد</h1>
        <p className="mt-1 text-slate-600 ">
          أضف رابط فيديو خارجي (مثل Bunny.net) إلى إحدى مواد باقة دراسية.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="text-sm font-medium text-slate-700">
            السنة الدراسية (الباقة)
          </label>
          <select
            {...register("packageId")}
            disabled={isLoadingPackages}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 "
          >
            <option value="">
              {isLoadingPackages ? "جارٍ التحميل..." : "اختر السنة الدراسية"}
            </option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} — {GRADE_LABELS[pkg.grade_level] ?? pkg.grade_level}
              </option>
            ))}
          </select>
          {errors.packageId ? (
            <p className="mt-1 text-sm text-rose-600">
              {errors.packageId.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 ">
            المادة الدراسية
          </label>
          <select
            {...register("subjectId")}
            disabled={!selectedPackageId || isLoadingSubjects}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 "
          >
            <option value="">
              {!selectedPackageId
                ? "اختر السنة الدراسية أولًا"
                : isLoadingSubjects
                  ? "جارٍ التحميل..."
                  : "اختر المادة"}
            </option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
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
          <label className="text-sm font-medium text-slate-700 ">
            عنوان الدرس
          </label>
          <input
            {...register("title")}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 "
            placeholder="مثال: مقدمة في المعادلات التربيعية"
          />
          {errors.title ? (
            <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            وصف الدرس (اختياري)
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 "
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 ">
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
