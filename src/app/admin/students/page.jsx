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
  }, [showToast]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">إدارة الطلاب</h1>
          <p className="mt-1 text-slate-600">
            نظرة سريعة على قاعدة الطلاب وطلبات الاشتراك
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/students/pending"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            الطلاب المعلقين
            {stats.pendingRequests > 0 ? (
              <span className="mr-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                {stats.pendingRequests}
              </span>
            ) : null}
          </Link>
          <Link
            href="/admin/students/all"
            className="rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            جميع الطلاب
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "إجمالي الطلاب", value: stats.total, icon: "👥" },
          { label: "الطلاب النشطون", value: stats.active, icon: "✓" },
          { label: "طلبات معلقة", value: stats.pendingRequests, icon: "⏳" },
          { label: "الموقوفون", value: stats.banned, icon: "✕" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {isLoading ? "..." : stat.value}
                </p>
              </div>
              <span className="text-4xl" aria-hidden="true">
                {stat.icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            أحدث الطلاب المسجّلين
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6" dir="rtl">
            {recentStudents.map((student) => (
              <div
                key={student.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-slate-900">
                    {student.full_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600" dir="ltr">
                    {student.phone}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      student.is_banned
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {student.is_banned ? "موقوف" : "نشط"}
                  </span>

                  <span className="text-sm text-slate-500">
                    {formatDate(student.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-200 px-6 py-4">
          <Link
            href="/admin/students/all"
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            عرض جميع الطلاب →
          </Link>
        </div>
      </div>
    </div>
  );
}
