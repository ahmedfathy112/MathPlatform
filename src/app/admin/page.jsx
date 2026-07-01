"use client";

import {
  Users,
  TrendingUp,
  Clock,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
} from "lucide-react";

export default function AdminPage() {
  const stats = [
    {
      label: "إجمالي الطلاب",
      value: "1,245",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      lightColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "أرباح الشهر",
      value: "45,320 ج.م",
      change: "+8%",
      trend: "up",
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      lightColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "الطلبة المعلقين",
      value: "38",
      change: "-5%",
      trend: "down",
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      lightColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      label: "الباقات النشطة",
      value: "12",
      change: "+2",
      trend: "up",
      icon: Package,
      color: "from-purple-500 to-purple-600",
      lightColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  const activities = [
    {
      id: 1,
      type: "new_student",
      userName: "محمد أحمد علي",
      action: "انضم طالب جديد",
      time: "قبل 5 دقائق",
      package: "باقة متوسطة",
      icon: "👤",
    },
    {
      id: 2,
      type: "payment",
      userName: "فاطمة محمد",
      action: "تم الدفع بنجاح",
      time: "قبل 20 دقيقة",
      amount: "450 ج.م",
      icon: "💳",
    },
    {
      id: 3,
      type: "exam_completed",
      userName: "سارة إبراهيم",
      action: "أكملت الاختبار",
      time: "قبل ساعة",
      score: "92%",
      icon: "📝",
    },
    {
      id: 4,
      type: "new_student",
      userName: "يوسف محمود",
      action: "انضم طالب جديد",
      time: "قبل ساعتين",
      package: "باقة بريميوم",
      icon: "👤",
    },
    {
      id: 5,
      type: "payment",
      userName: "نور العطار",
      action: "تم الدفع بنجاح",
      time: "قبل 3 ساعات",
      amount: "650 ج.م",
      icon: "💳",
    },
  ];

  const StatCard = ({
    label,
    value,
    change,
    trend,
    icon: Icon,
    color,
    lightColor,
  }) => (
    <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          <div className="mt-4 flex items-center gap-1">
            {trend === "up" ? (
              <ArrowUpRight size={16} className="text-emerald-500" />
            ) : (
              <ArrowDownRight size={16} className="text-slate-400" />
            )}
            <span
              className={`text-sm font-semibold ${
                trend === "up"
                  ? "text-emerald-500"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {change}
            </span>
          </div>
        </div>
        <div className={`${lightColor} rounded-lg p-3`}>
          <Icon
            size={24}
            className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          لوحة التحكم
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          مرحباً بك في لوحة إدارة منصة الأستاذ
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            أحدث النشاطات
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  النشاط
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  التفاصيل
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الوقت
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4">
                    <span className="text-2xl">{activity.icon}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activity.userName}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-slate-900 dark:text-white">
                        {activity.action}
                      </p>
                      {activity.package && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {activity.package}
                        </p>
                      )}
                      {activity.amount && (
                        <span className="inline-flex w-fit rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {activity.amount}
                        </span>
                      )}
                      {activity.score && (
                        <span className="inline-flex w-fit rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {activity.score}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {activity.time}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <button className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            عرض جميع النشاطات →
          </button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            أفضل الدورات
          </h3>
          <div className="mt-6 space-y-4">
            {[
              { name: "الجبر المتقدم", students: 245, progress: 78 },
              { name: "الهندسة التحليلية", students: 198, progress: 65 },
              { name: "التحليل والتفاضل", students: 156, progress: 82 },
            ].map((course, idx) => (
              <div key={idx} className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {course.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {course.students} طالب
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {course.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            الإحصائيات الشهرية
          </h3>
          <div className="mt-6 space-y-4">
            {[
              { label: "الإيرادات", value: "45,320", change: "+12%" },
              { label: "الطلاب الجدد", value: "143", change: "+8%" },
              { label: "الاختبارات", value: "287", change: "+15%" },
              { label: "الاكتمال", value: "72%", change: "+3%" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50"
              >
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {stat.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
