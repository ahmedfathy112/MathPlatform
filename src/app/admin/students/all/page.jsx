"use client";

import { useMemo, useState } from "react";
import { Search, Users, ArrowUpRight, Edit, Trash2, Eye } from "lucide-react";

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
  },
  {
    id: 3,
    name: "سارة حسن أحمد",
    email: "sarah@example.com",
    phone: "0503234567",
    joinDate: "2024-03-10",
    status: "معلق",
    package: "باقة أساسية",
    score: 64,
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
  },
  {
    id: 5,
    name: "نور العطار محمد",
    email: "noor@example.com",
    phone: "0505234567",
    joinDate: "2024-02-05",
    status: "غير فعال",
    package: "باقة أساسية",
    score: 45,
  },
  {
    id: 6,
    name: "ريم أحمد محمود",
    email: "reem@example.com",
    phone: "0506234567",
    joinDate: "2024-03-18",
    status: "نشط",
    package: "باقة متوسطة",
    score: 88,
  },
];

export default function AllStudentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = [student.name, student.email, student.package]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            جميع الطلاب
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            راجع كافة الطلاب وحالتهم، وصِل إلى التفاصيل في مكان واحد.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02]">
          <Users size={18} /> تصدير البيانات
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-4 lg:grid-cols-[1fr,280px] lg:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute inset-y-0 right-4 my-auto text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث عن اسم طالب أو باقة أو بريد..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {[
              { key: "all", label: "الكل" },
              { key: "نشط", label: "نشط" },
              { key: "معلق", label: "معلق" },
              { key: "غير فعال", label: "غير فعال" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setStatusFilter(option.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === option.key
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-4 font-semibold">الطالب</th>
              <th className="px-6 py-4 font-semibold">الباقة</th>
              <th className="px-6 py-4 font-semibold">تاريخ الانضمام</th>
              <th className="px-6 py-4 font-semibold">الحالة</th>
              <th className="px-6 py-4 font-semibold">الدرجة</th>
              <th className="px-6 py-4 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {student.email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {student.package}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {student.joinDate}
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
                <td className="px-6 py-4 text-slate-900 dark:text-white">
                  {student.score}%
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white">
                      <Eye size={16} />
                    </button>
                    <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white">
                      <Edit size={16} />
                    </button>
                    <button className="rounded-lg p-2 text-red-500 transition hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            أحدث التقارير
          </p>
          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            نسبة التفاعل العام مرتفعة
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            قم بتحديث الملكية وتأكد من استجابة الطلاب للمهام والمحتوى.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                عدد الطلاب
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {filteredStudents.length}
              </p>
            </div>
            <div className="rounded-3xl bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {statusFilter === "all" ? "جميع الحالات" : statusFilter}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
