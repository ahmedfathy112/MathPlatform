"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { useToast } from "../components/ui/ToastProvider";
import { formatDateTime } from "../utils/supabase/adminHelpers";


function LedgerStat({ label, value, tone, isLoading }) {
  return (
    <div className="flex-1 px-6 py-5 ">
      <p className="font-mono text-[11px] uppercase tracking-wider text-[#8A9587]">
        {label}
      </p>
      <p
        className="mt-2 font-mono text-3xl font-bold tabular-nums"
        style={{ color: tone }}
      >
        {isLoading ? "···" : value}
      </p>
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
        // Plain fetch + client-side merge on purpose, not an embedded
        // relationship select — payment_requests has two FKs into profiles
        // (student_id and reviewed_by), and PostgREST's disambiguation
        // hint syntax proved version-dependent against this project's setup.
        supabase
          .from("payment_requests")
          .select(
            "id, status, amount_claimed, created_at, student_id, package_id",
          )
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

      const recentRequests = recentRequestRows ?? [];
      const studentIds = [...new Set(recentRequests.map((r) => r.student_id))];
      const packageIds = [...new Set(recentRequests.map((r) => r.package_id))];

      const [{ data: studentRows }, { data: activityPackageRows }] =
        await Promise.all([
          studentIds.length
            ? supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", studentIds)
            : Promise.resolve({ data: [] }),
          packageIds.length
            ? supabase.from("packages").select("id, name").in("id", packageIds)
            : Promise.resolve({ data: [] }),
        ]);

      if (cancelled) return;

      const studentById = new Map((studentRows ?? []).map((s) => [s.id, s]));
      const packageById = new Map(
        (activityPackageRows ?? []).map((p) => [p.id, p]),
      );

      const mergedActivity = [
        ...(recentStudents ?? []).map((s) => ({
          id: `student-${s.id}`,
          label: `انضم طالب جديد — ${s.full_name}`,
          time: s.created_at,
        })),
        ...recentRequests.map((r) => {
          const studentName = studentById.get(r.student_id)?.full_name ?? "";
          const packageName = packageById.get(r.package_id)?.name ?? "";
          return {
            id: `request-${r.id}`,
            label:
              r.status === "approved"
                ? `اعتماد اشتراك — ${studentName} / ${packageName}`
                : `رفض طلب — ${studentName} / ${packageName}`,
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

  const maxActive = topPackages[0]?.activeStudents || 1;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-[#1B241C]">السجل العام</h1>
        <p className="mt-1 text-sm text-[#4A594C]">
          نظرة على الطلاب والباقات والمدفوعات هذا الأسبوع
        </p>
      </div>

      {/* Ledger strip — one ruled bar, columns divided by hairlines, no
          icon-in-box tiles and no drop shadows. */}
      <div className="flex divide-x divide-x-reverse divide-[#DCE3D8] rounded-md border border-[#DCE3D8] bg-white max-md:flex-col max-md:divide-x-0 max-md:divide-y max-md:justify-center">
        <LedgerStat
          label="إجمالي الطلاب"
          value={stats.totalStudents}
          tone="#1B241C"
          isLoading={isLoading}
        />
        <LedgerStat
          label="إيرادات معتمدة"
          value={`${stats.revenue.toLocaleString()} ج.م`}
          tone="#1F6E43"
          isLoading={isLoading}
        />
        <LedgerStat
          label="طلبات معلقة"
          value={stats.pendingRequests}
          tone="#A6791F"
          isLoading={isLoading}
        />
        <LedgerStat
          label="باقات نشطة"
          value={stats.activePackages}
          tone="#223A5E"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr,1fr]">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B241C]">
              أحدث القيود
            </h2>
            <span className="font-mono text-xs text-[#8A9587]">سجل الحركة</span>
          </div>
          <div className="rounded-md border border-[#DCE3D8] bg-white">
            {isLoading ? (
              <p className="p-6 text-sm text-[#8A9587]">جارٍ التحميل...</p>
            ) : activity.length === 0 ? (
              <p className="p-6 text-sm text-[#8A9587]">لا توجد حركات بعد.</p>
            ) : (
              activity.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-baseline gap-4 border-b border-[#EEF1EA] px-5 py-3 text-sm last:border-b-0"
                >
                  <span className="font-mono text-[11px] tabular-nums text-[#B7BFB3]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[#1B241C]">{item.label}</span>
                  <span className="font-mono text-[11px] tabular-nums text-[#8A9587]">
                    {formatDateTime(item.time)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B241C]">
              أكثر الباقات اشتراكًا
            </h2>
            <Link
              href="/admin/packages"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#223A5E] hover:underline"
            >
              كل الباقات
              <ArrowLeft size={12} />
            </Link>
          </div>
          <div className="rounded-md border border-[#DCE3D8] bg-white p-5">
            {isLoading ? (
              <p className="text-sm text-[#8A9587]">جارٍ التحميل...</p>
            ) : topPackages.length === 0 ? (
              <p className="text-sm text-[#8A9587]">
                لا توجد بيانات اشتراك بعد.
              </p>
            ) : (
              <div className="space-y-4">
                {topPackages.map((pkg, index) => (
                  <div key={pkg.id}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-[#1B241C]">
                        <span className="ml-2 font-mono text-[11px] text-[#B7BFB3]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {pkg.name}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-[#4A594C]">
                        {pkg.activeStudents}
                      </span>
                    </div>
                    <div className="mt-1.5 h-[3px] w-full bg-[#EEF1EA]">
                      <div
                        className="h-full bg-[#1F6E43]"
                        style={{
                          width: `${Math.max(4, Math.round((pkg.activeStudents / maxActive) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
