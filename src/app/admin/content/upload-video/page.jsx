"use client";

import { useState } from "react";
import { UploadCloud, FileText, Star, Check, ArrowUpRight } from "lucide-react";

export default function UploadVideoPage() {
  const [formState, setFormState] = useState({
    course: "الجبر المتقدم",
    title: "",
    description: "",
    videoUrl: "",
    resources: "",
    publish: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (event) => {
    const value =
      field === "publish" ? event.target.checked : event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            تحميل فيديو تعليمي
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            أضف درس فيديو جديد إلى دورة موجودة مع الموارد والمختصرات.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">
          <UploadCloud size={18} /> حزمة المحتوى
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="grid gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                الدورة
              </label>
              <select
                value={formState.course}
                onChange={handleChange("course")}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
              >
                <option>الجبر المتقدم</option>
                <option>الهندسة التحليلية</option>
                <option>التحليل والتفاضل</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                عنوان الفيديو
              </label>
              <input
                value={formState.title}
                onChange={handleChange("title")}
                placeholder="أدخل عنوان الدرس"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                رابط الفيديو
              </label>
              <input
                value={formState.videoUrl}
                onChange={handleChange("videoUrl")}
                placeholder="https://"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                وصف الدرس
              </label>
              <textarea
                value={formState.description}
                onChange={handleChange("description")}
                rows={5}
                placeholder="أضف وصفاً موجزاً للمحتوى والنتائج التعليمية"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                الموارد المرفقة
              </label>
              <input
                value={formState.resources}
                onChange={handleChange("resources")}
                placeholder="مثلاً: ملاحظات PDF أو اختبار تدريبي"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
              />
            </div>

            <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    نشر الفيديو
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    اختيار الحالة المرئية للطلاب بعد حفظ المحتوى
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={formState.publish}
                    onChange={handleChange("publish")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  نشر الآن
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              <UploadCloud size={18} /> حفظ الفيديو
            </button>
          </div>

          {submitted && (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <Check size={18} />
                <span>تم حفظ الدرس بنجاح! يمكن للطلاب الوصول إليه الآن.</span>
              </div>
            </div>
          )}
        </form>

        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">نصيحة للمحتوى</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  استخدم عناوين واضحة ووصفًا موجزًا لتحسين تجربة الطلاب.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              إرشادات سريعة
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <Star size={18} className="mt-1 text-yellow-500" /> اختر اسمًا
                موجزًا وواضحًا.
              </li>
              <li className="flex items-start gap-3">
                <Star size={18} className="mt-1 text-yellow-500" /> أضف رابط
                فيديو صالح من منصة آمنة.
              </li>
              <li className="flex items-start gap-3">
                <Star size={18} className="mt-1 text-yellow-500" /> ضمّن موارد
                إضافية لتثبيت التعلم.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl bg-blue-950/10 p-5 text-sm text-slate-900 dark:text-white dark:bg-blue-950/20">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">خطوة إضافية</p>
              <ArrowUpRight size={18} />
            </div>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              بعد الحفظ، يمكنك تعزيز الفيديو باختبار قصير وسؤال واجب.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
