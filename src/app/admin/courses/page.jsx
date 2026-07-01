"use client";

import { useState } from "react";
import {
  BookOpen,
  PlayCircle,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
} from "lucide-react";

const courses = [
  {
    id: 1,
    title: "الجبر المتقدم",
    instructor: "أ. السيد نور",
    students: 320,
    completion: 86,
    lessons: 18,
    duration: "12 ساعة",
    description:
      "دورة مركزة تضم مفاهيم الجبر المتقدم مع نماذج تطبيقية وحل مسائل مباشرة.",
    featured: true,
  },
  {
    id: 2,
    title: "الهندسة التحليلية",
    instructor: "أ. السيد نور",
    students: 280,
    completion: 74,
    lessons: 14,
    duration: "10 ساعة",
    description:
      "محتوى شامل لتقوية التمثيل البياني والمعادلات في الهندسة التحليلية.",
  },
  {
    id: 3,
    title: "التحليل والتفاضل",
    instructor: "أ. السيد نور",
    students: 215,
    completion: 91,
    lessons: 22,
    duration: "15 ساعة",
    description:
      "دورة متقدمة تعالج التفاضل والتكامل بأسلوب عملي وتطبيقي مع مراجعات سريعة.",
  },
];

export default function CoursesPage() {
  const [activeCourseId, setActiveCourseId] = useState(courses[0].id);
  const activeCourse = courses.find((course) => course.id === activeCourseId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            إدارة الدورات
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            راقب مستويات الدورات، وأضف محتوى الفيديو الجديد بسهولة.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02]">
          <PlayCircle size={18} /> إضافة دورة جديدة
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr,0.5fr]">
        <div className="grid gap-6 lg:grid-cols-2">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setActiveCourseId(course.id)}
              className={`group rounded-3xl border p-6 text-left transition ${
                activeCourseId === course.id
                  ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400/40 dark:bg-slate-900"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-400 dark:hover:bg-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {course.instructor}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                    {course.title}
                  </h2>
                </div>
                {course.featured && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    مميز
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                {course.description}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
                  <p className="text-slate-500 dark:text-slate-400">
                    عدد الطلاب
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {course.students}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
                  <p className="text-slate-500 dark:text-slate-400">
                    نسبة الإكمال
                  </p>
                  <p className="mt-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {course.completion}%
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                الدورة الحالية
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {activeCourse.title}
              </h2>
            </div>
            <div className="rounded-3xl bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {activeCourse.duration}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    تقدم الدورة
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {activeCourse.completion}%
                  </p>
                </div>
                <div className="rounded-3xl bg-blue-950/5 px-3 py-2 text-sm text-blue-600 dark:bg-blue-950/20 dark:text-blue-300">
                  {activeCourse.lessons} دروس
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: `${activeCourse.completion}%` }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  المحتوى المتوفر
                </p>
                <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
                  <ArrowRight size={16} /> تفاصيل أكثر
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-800">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      أحدث فيديو
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      حل معادلات من الدرجة الثانية
                    </p>
                  </div>
                  <PlayCircle size={24} className="text-blue-600" />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-800">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      محاضرة مباشرة
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      نموذج تدريب سريع
                    </p>
                  </div>
                  <Clock
                    size={24}
                    className="text-slate-500 dark:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                أداء الدورة
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 size={14} /> استقرار جيد
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  طلاب نشطون
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {activeCourse.students}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  نسبة الإكمال
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {activeCourse.completion}%
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
