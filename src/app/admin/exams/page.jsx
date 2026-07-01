"use client";

import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Clock, CheckCircle } from "lucide-react";

export default function ExamsPage() {
  const exams = [
    {
      id: 1,
      name: "اختبار الجبر - المستوى الأول",
      course: "الجبر المتقدم",
      questions: 50,
      duration: 90,
      students: 245,
      completed: 187,
      avgScore: 78,
      status: "مفعل",
    },
    {
      id: 2,
      name: "اختبار الهندسة - الفصل الثاني",
      course: "الهندسة التحليلية",
      questions: 40,
      duration: 75,
      students: 198,
      completed: 156,
      avgScore: 82,
      status: "مفعل",
    },
    {
      id: 3,
      name: "اختبار التحليل الشامل",
      course: "التحليل والتفاضل",
      questions: 60,
      duration: 120,
      students: 156,
      completed: 89,
      avgScore: 74,
      status: "معطل",
    },
    {
      id: 4,
      name: "اختبار المراجعة النهائية",
      course: "المراجعة الشاملة",
      questions: 80,
      duration: 150,
      students: 312,
      completed: 287,
      avgScore: 85,
      status: "مفعل",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            إدارة الامتحانات
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            إدارة الاختبارات والأسئلة
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/exams/create"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02]"
          >
            <Plus size={20} /> إنشاء اختبار
          </Link>
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
            عرض النتائج
          </button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {exam.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {exam.course}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  exam.status === "مفعل"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"
                }`}
              >
                {exam.status}
              </span>
            </div>

            <div className="mb-4 grid gap-3 border-y border-slate-200 py-4 dark:border-slate-700 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  عدد الأسئلة
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {exam.questions}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  المدة الزمنية
                </p>
                <p className="mt-1 flex items-center gap-1 text-lg font-bold text-slate-900 dark:text-white">
                  <Clock size={16} /> {exam.duration} دقيقة
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  إجمالي الطلاب
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {exam.students}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  المتوسط الحسابي
                </p>
                <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                  {exam.avgScore}%
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  معدل الإكمال
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {exam.completed} / {exam.students}
                </p>
              </div>
              <div className="h-12 w-24 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {Math.round((exam.completed / exam.students) * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 rounded-lg border border-slate-200 py-2 font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">
                <Edit size={16} className="mx-auto" />
              </button>
              <button className="flex-1 rounded-lg border border-slate-200 py-2 font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">
                <Eye size={16} className="mx-auto" />
              </button>
              <button className="flex-1 rounded-lg border border-red-200 py-2 font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20">
                <Trash2 size={16} className="mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            تفاصيل الاختبارات
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الاختبار
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الدورة
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الأسئلة
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  المشاركون
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  المتوسط
                </th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr
                  key={exam.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {exam.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {exam.course}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {exam.questions} سؤال
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {exam.completed} / {exam.students}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {exam.avgScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
