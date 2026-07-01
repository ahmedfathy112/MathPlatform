"use client";

import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  DollarSign,
  Check,
  MoreVertical,
} from "lucide-react";

export default function PackagesPage() {
  const packages = [
    {
      id: 1,
      name: "الباقة الأساسية",
      price: 99,
      duration: "شهر",
      students: 245,
      courses: 3,
      features: ["وصول محدود للدروس", "2 اختبار شهري", "دعم البريد"],
      active: true,
    },
    {
      id: 2,
      name: "الباقة المتوسطة",
      price: 199,
      duration: "شهر",
      students: 312,
      courses: 8,
      features: ["وصول كامل للدروس", "8 اختبارات شهرية", "دعم الدردشة"],
      active: true,
    },
    {
      id: 3,
      name: "الباقة البريميوم",
      price: 349,
      duration: "شهر",
      students: 189,
      courses: 15,
      features: ["وصول VIP للدروس", "اختبارات غير محدودة", "دعم أولوي 24/7"],
      active: true,
    },
    {
      id: 4,
      name: "الباقة السنوية",
      price: 999,
      duration: "سنة",
      students: 78,
      courses: 15,
      features: ["وصول VIP طوال السنة", "شهادات معتمدة", "كافة المميزات"],
      active: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            إدارة الباقات
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            إدارة خطط الاشتراك والأسعار
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105">
          <Plus size={20} />
          باقة جديدة
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {pkg.name}
                </h3>
                <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {pkg.price}
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {" "}
                    ج.م/{pkg.duration}
                  </span>
                </p>
              </div>
              {pkg.active && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Check size={14} />
                  نشط
                </span>
              )}
            </div>

            <div className="mb-4 space-y-2 border-y border-slate-200 py-4 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users size={16} />
                <span>{pkg.students} طالب</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="h-4 w-4 rounded bg-blue-500" />
                <span>{pkg.courses} دورة</span>
              </div>
            </div>

            <ul className="mb-6 space-y-2">
              {pkg.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                >
                  <Check
                    size={16}
                    className="mt-0.5 flex-shrink-0 text-emerald-500"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

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
            إحصائيات الباقات
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الباقة
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  السعر
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  عدد الطلاب
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الإيرادات الشهرية
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {pkg.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {pkg.price} ج.م
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {pkg.students}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {(pkg.price * pkg.students).toLocaleString()} ج.م
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      نشطة
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
