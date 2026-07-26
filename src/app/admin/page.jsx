"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Clock, Package } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { useToast } from "../components/ui/ToastProvider";
import { Skeleton } from "../components/ui/Skeleton";
import { formatDateTime } from "../utils/supabase/adminHelpers";

function StatCard({ label, value, icon: Icon, lightColor }) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`${lightColor} rounded-lg p-3`}>
          <Icon size={24} className="text-slate-700 dark:text-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingRequests: 0,
    activePackages: 0,
    revenue: 0,
  });
  const [topPackages, setTopPackages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);

      const [
        { count: totalStudents },
        { count: pendingRequests },
        { data: packageRows },
        { data: approvedRequests, error: approvedError },
        { data: activeSubscriptionRows },
        { data: recentStudents },
        { data: recentRequestRows },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "student"),
        supabase
          .from("payment_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("packages").select("id, name").eq("is_active", true),
        supabase
          .from("payment_requests")
          .select("amount_claimed")
          .eq("status", "approved"),
        supabase
          .from("subscriptions")
          .select("package_id")
          .eq("status", "active"),
        supabase
          .from("profiles")
          .select("id, full_name, created_at")
          .eq("role", "student")
          .order("created_at", { ascending: false })
          .limit(5),
        // No embedded relationship syntax here on purpose (see
        // fetchRecentRequestActivity below) — payment_requests has two FKs
        // into profiles (student_id and reviewed_by), and PostgREST's
        // disambiguation hint syntax proved version-dependent, so plain
        // fetch + client-side merge is the reliable path.
        supabase
          .from("payment_requests")
          .select("id, status, amount_claimed, created_at, student_id, package_id")
          .in("status", ["approved", "rejected"])
          .order("reviewed_at", { ascending: false })
          .limit(5),
      ]);

      if (cancelled) return;

      if (approvedError) {
        showToast({
          type: "error",
          message: "تعذر تحميل بعض إحصائيات لوحة التحكم.",
        });
      }

      const revenue = (approvedRequests ?? []).reduce(
        (sum, row) => sum + Number(row.amount_claimed || 0),
        0,
      );

      const activeCountByPackage = new Map();
      (activeSubscriptionRows ?? []).forEach((row) => {
        activeCountByPackage.set(
          row.package_id,
          (activeCountByPackage.get(row.package_id) ?? 0) + 1,
        );
      });

      const rankedPackages = (packageRows ?? [])
        .map((pkg) => ({
          ...pkg,
          activeStudents: activeCountByPackage.get(pkg.id) ?? 0,
        }))
        .sort((a, b) => b.activeStudents - a.activeStudents)
        .slice(0, 5);

      // Resolve student names + package names for the activity feed
      // separately, then merge — see the comment on the query above.
      const recentRequests = recentRequestRows ?? [];
      const studentIds = [...new Set(recentRequests.map((r) => r.student_id))];
      const packageIds = [...new Set(recentRequests.map((r) => r.package_id))];

      const [{ data: studentRows }, { data: activityPackageRows }] = await Promise.all([
        studentIds.length
          ? supabase.from("profiles").select("id, full_name").in("id", studentIds)
          : Promise.resolve({ data: [] }),
        packageIds.length
          ? supabase.from("packages").select("id, name").in("id", packageIds)
          : Promise.resolve({ data: [] }),
      ]);

      if (cancelled) return;

      const studentById = new Map((studentRows ?? []).map((s) => [s.id, s]));
      const packageById = new Map((activityPackageRows ?? []).map((p) => [p.id, p]));

      const mergedActivity = [
        ...(recentStudents ?? []).map((s) => ({
          id: `student-${s.id}`,
          icon: "👤",
          label: `انضم طالب جديد: ${s.full_name}`,
          time: s.created_at,
        })),
        ...recentRequests.map((r) => {
          const studentName = studentById.get(r.student_id)?.full_name ?? "";
          const packageName = packageById.get(r.package_id)?.name ?? "";
          return {
            id: `request-${r.id}`,
            icon: r.status === "approved" ? "💳" : "🚫",
            label:
              r.status === "approved"
                ? `تم تفعيل اشتراك ${studentName} في ${packageName}`
                : `تم رفض طلب ${studentName} في ${packageName}`,
            time: r.created_at,
          };
        }),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 8);

      setStats({
        totalStudents: totalStudents ?? 0,
        pendingRequests: pendingRequests ?? 0,
        activePackages: packageRows?.length ?? 0,
        revenue,
      });
      setTopPackages(rankedPackages);
      setActivity(mergedActivity);
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          لوحة التحكم
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          مرحباً بك في لوحة إدارة منصة الأستاذ
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="إجمالي الطلاب"
          value={isLoading ? "..." : stats.totalStudents}
          icon={Users}
          lightColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          label="إجمالي الإيرادات المعتمدة"
          value={isLoading ? "..." : `${stats.revenue.toLocaleString()} ج.م`}
          icon={TrendingUp}
          lightColor="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard
          label="طلبات معلقة"
          value={isLoading ? "..." : stats.pendingRequests}
          icon={Clock}
          lightColor="bg-orange-100 dark:bg-orange-900/30"
        />
        <StatCard
          label="الباقات النشطة"
          value={isLoading ? "..." : stats.activePackages}
          icon={Package}
          lightColor="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            أحدث النشاطات
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6">
            <Skeleton className="h-56 w-full" />
          </div>
        ) : activity.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            لا توجد نشاطات بعد.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {activity.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDateTime(item.time)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          أكثر الباقات اشتراكًا
        </h3>
        {isLoading ? (
          <Skeleton className="mt-6 h-40 w-full" />
        ) : topPackages.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            لا توجد بيانات اشتراك بعد.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {topPackages.map((pkg) => {
              const maxCount = topPackages[0]?.activeStudents || 1;
              const width = Math.max(
                6,
                Math.round((pkg.activeStudents / maxCount) * 100),
              );
              return (
                <div
                  key={pkg.id}
                  className="flex items-end justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {pkg.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {pkg.activeStudents} طالب نشط
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
