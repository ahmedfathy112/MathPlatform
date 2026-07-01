"use client";

import {
  Search,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  Eye,
  CheckCircle,
  Trash2,
} from "lucide-react";

const pendingStudents = [
  {
    id: 1,
    name: "هند محمود صالح",
    email: "hind@example.com",
    phone: "0507345123",
    requestedAt: "قبل 12 ساعة",
    requirement: "مراجعة ملف الاشتراك",
    status: "قيد المراجعة",
  },
  {
    id: 2,
    name: "عمر خالد حسين",
    email: "omar@example.com",
    phone: "0508123456",
    requestedAt: "قبل يوم",
    requirement: "إرفاق وثيقة الهوية",
    status: "في الانتظار",
  },
  {
    id: 3,
    name: "ياسمين إبراهيم",
    email: "yasmin@example.com",
    phone: "0509876543",
    requestedAt: "قبل يومين",
    requirement: "مراجعة باقة التعلم",
    status: "قيد المراجعة",
  },
  {
    id: 4,
    name: "سلمان العتيبي",
    email: "salman@example.com",
    phone: "0505566778",
    requestedAt: "قبل 3 أيام",
    requirement: "التحقق من الدفع",
    status: "في الانتظار",
  },
];

export default function PendingStudentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            الطلاب المعلقين
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            راجع الطلبات المعلقة واعتمد التسجيلات الجديدة بسرعة.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500">
            <CheckCircle size={18} /> اعتماد الكل
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
            <Trash2 size={18} /> رفض المحددين
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              عدد الطلبات المعلقة
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {pendingStudents.length}
            </p>
          </div>
          <div className="relative max-w-md">
            <Search
              className="pointer-events-none absolute inset-y-0 right-4 my-auto text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ابحث عن طالب أو حالة..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {pendingStudents.map((student) => (
          <div
            key={student.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {student.name}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {student.requirement}
                </p>
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                {student.status}
              </span>
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 dark:border-slate-700">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Mail size={16} />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Phone size={16} />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Clock size={16} />
                <span>تم التقديم {student.requestedAt}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
                <CheckCircle size={16} /> اعتمد الطلب
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">
                <Eye size={16} /> معاينة البيانات
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              نظرة عامة على حالات الانتظار
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              راقب جميع الطلبات المعلقة وتحقق من الطلبات التي تحتاج استجابة
              سريعة.
            </p>
          </div>
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            تحديث آلي كل 5 دقائق
          </span>
        </div>
      </div>
    </div>
  );
}
