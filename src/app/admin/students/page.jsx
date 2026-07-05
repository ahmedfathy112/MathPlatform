"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import { useToast } from "../../components/ui/ToastProvider";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDate } from "../../utils/supabase/adminHelpers";

export default function StudentsPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
    pendingRequests: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);

      const [
        { count: total },
        { count: banned },
        { count: pendingRequests },
        { data: recent, error: recentError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "student"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "student")
          .eq("is_banned", true),
        supabase
          .from("payment_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("profiles")
          .select("id, full_name, phone, is_banned, created_at")
          .eq("role", "student")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      if (cancelled) return;

      if (recentError) {
        showToast({ type: "error", message: "تعذر تحميل بيانات الطلاب." });
      }

      setStats({
        total: total ?? 0,
        active: (total ?? 0) - (banned ?? 0),
        banned: banned ?? 0,
        pendingRequests: pendingRequests ?? 0,
      });
      setRecentStudents(recent ?? []);
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            إدارة الطلاب
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            نظرة سريعة على قاعدة الطلاب وطلبات الاشتراك
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/students/pending"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            الطلاب المعلقين
            {stats.pendingRequests > 0 ? (
              <span className="mr-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                {stats.pendingRequests}
              </span>
            ) : null}
          </Link>
          <Link
            href="/admin/students/all"
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            جميع الطلاب
          </Link>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "إجمالي الطلاب", value: stats.total, icon: "👥" },
          { label: "الطلاب النشطون", value: stats.active, icon: "✓" },
          { label: "طلبات معلقة", value: stats.pendingRequests, icon: "⏳" },
          { label: "الموقوفون", value: stats.banned, icon: "✕" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {isLoading ? "..." : stat.value}
                </p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            أحدث الطلاب المسجّلين
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                    اسم الطالب
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                    الهاتف
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                    تاريخ الانضمام
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {student.full_name}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400"
                      dir="ltr"
                    >
                      {student.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          student.is_banned
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}
                      >
                        {student.is_banned ? "موقوف" : "نشط"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(student.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <Link
            href="/admin/students/all"
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            عرض جميع الطلاب →
          </Link>
        </div>
      </div>
    </div>
  );
}
