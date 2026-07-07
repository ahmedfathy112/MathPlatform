"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, FileCheck2, Hourglass, ArrowLeft } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { useToast } from "../components/ui/ToastProvider";
import { Skeleton } from "../components/ui/Skeleton";

function GlowStatCard({ label, value, icon: Icon, glow, isLoading }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/20 ${glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {isLoading ? "..." : value}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AssistantOverviewPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    pending: 0,
    activeExams: 0,
    reviewedToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);
      const now = new Date().toISOString();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [
        { count: pending, error: pendingError },
        { count: activeExams },
        { count: reviewedToday },
      ] = await Promise.all([
        supabase
          .from("payment_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("exams")
          .select("id", { count: "exact", head: true })
          .lte("start_time", now)
          .gte("end_time", now),
        supabase
          .from("payment_requests")
          .select("id", { count: "exact", head: true })
          .in("status", ["approved", "rejected"])
          .gte("reviewed_at", startOfToday.toISOString()),
      ]);

      if (cancelled) return;

      if (pendingError) {
        showToast({ type: "error", message: "تعذر تحميل إحصائيات اللوحة." });
      }

      setStats({
        pending: pending ?? 0,
        activeExams: activeExams ?? 0,
        reviewedToday: reviewedToday ?? 0,
      });
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
        <h1 className="text-3xl font-bold text-white">لوحة المساعد</h1>
        <p className="mt-1 text-slate-400">
          نظرة سريعة على الطلبات المعلقة والاختبارات الجارية
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-36 w-full rounded-3xl bg-slate-800/60"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <GlowStatCard
            label="طلاب معلقون"
            value={stats.pending}
            icon={Hourglass}
            glow="shadow-[0_0_25px_rgba(250,204,21,0.15)]"
            isLoading={isLoading}
          />
          <GlowStatCard
            label="اختبارات جارية الآن"
            value={stats.activeExams}
            icon={Clock3}
            glow="shadow-[0_0_25px_rgba(34,211,238,0.15)]"
            isLoading={isLoading}
          />
          <GlowStatCard
            label="تمت مراجعتهم اليوم"
            value={stats.reviewedToday}
            icon={FileCheck2}
            glow="shadow-[0_0_25px_rgba(139,92,246,0.18)]"
            isLoading={isLoading}
          />
        </div>
      )}

      {stats.pending > 0 && !isLoading ? (
        <Link
          href="/assistant/students"
          className="flex items-center justify-between rounded-3xl border border-amber-400/20 bg-amber-500/5 p-6 text-amber-200 transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-500/10"
        >
          <span className="text-sm font-medium">
            لديك {stats.pending} طلب اشتراك بانتظار المراجعة
          </span>
          <ArrowLeft size={18} />
        </Link>
      ) : null}
    </div>
  );
}
