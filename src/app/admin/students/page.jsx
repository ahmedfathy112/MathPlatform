"use client";

import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Check, X, Mail, Phone } from "lucide-react";

export default function StudentsPage() {
  const students = [
    {
      id: 1,
      name: "محمد أحمد علي",
      email: "mohammed@example.com",
      phone: "0501234567",
      joinDate: "2024-01-15",
      status: "نشط",
      package: "باقة بريميوم",
      score: 92,
      completed: 12,
    },
    {
      id: 2,
      name: "فاطمة محمد إبراهيم",
      email: "fatima@example.com",
      phone: "0502234567",
      joinDate: "2024-02-20",
      status: "نشط",
      package: "باقة متوسطة",
      score: 87,
      completed: 8,
    },
    {
      id: 3,
      name: "سارة حسن أحمد",
      email: "sarah@example.com",
      phone: "0503234567",
      joinDate: "2024-03-10",
      status: "معلق",
      package: "باقة أساسية",
      score: 0,
      completed: 0,
    },
    {
      id: 4,
      name: "يوسف محمود علي",
      email: "youssef@example.com",
      phone: "0504234567",
      joinDate: "2024-01-22",
      status: "نشط",
      package: "باقة بريميوم",
      score: 95,
      completed: 15,
    },
    {
      id: 5,
      name: "نور العطار محمد",
      email: "noor@example.com",
      phone: "0505234567",
      joinDate: "2024-02-05",
      status: "نشط",
      package: "باقة متوسطة",
      score: 85,
      completed: 10,
    },
    {
      id: 6,
      name: "ريم أحمد محمود",
      email: "reem@example.com",
      phone: "0506234567",
      joinDate: "2024-03-18",
      status: "غير فعال",
      package: "باقة أساسية",
      score: 45,
      completed: 2,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            إدارة الطلاب والأكواد
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            إدارة الطلاب والأكواد الترويجية
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/students/pending"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            الطلاب المعلقين
          </Link>
          <Link
            href="/admin/students/all"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            جميع الطلاب
          </Link>
          <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02]">
            <Plus size={20} /> طالب جديد
          </button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "إجمالي الطلاب", value: "1,245", icon: "👥" },
          { label: "الطلاب النشطون", value: "982", icon: "✓" },
          { label: "المعلقون", value: "145", icon: "⏳" },
          { label: "الغير فعالين", value: "118", icon: "✕" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            قائمة الطلاب
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  اسم الطالب
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الباقة
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الدرجة
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        منذ {student.joinDate}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`mailto:${student.email}`}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Mail size={14} />
                      {student.email}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        student.status === "نشط"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : student.status === "معلق"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {student.package}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {student.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300">
                        <Eye size={18} />
                      </button>
                      <button className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300">
                        <Edit size={18} />
                      </button>
                      <button className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            عرض جميع الطلاب →
          </button>
        </div>
      </div>
    </div>
  );
}
