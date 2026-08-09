"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, Sparkles } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { useAuthStore, selectProfile } from "../store/useAuthStore";
import { fetchPackagesWithSubscriptions } from "../utils/supabase/queries";
import { useToast } from "../components/ui/ToastProvider";
import { Skeleton } from "../components/ui/Skeleton";
import PackageCard from "../components/PackageCard";
import VideoLessonCard from "../components/VideoLessonCard";

export default function DashboardPage() {
  const profile = useAuthStore(selectProfile);
  const { showToast } = useToast();

  const [myPackages, setMyPackages] = useState([]);
  const [upcomingExamCount, setUpcomingExamCount] = useState(0);
  const [latestVideo, setLatestVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);

      const { packages, error } = await fetchPackagesWithSubscriptions(
        supabase,
        profile,
      );

      if (cancelled) return;

      if (error) {
        showToast({ type: "error", message: error });
        setIsLoading(false);
        return;
      }

      const subscribedPackages = packages.filter((p) => p.status !== null);
      const activePackageIds = packages
        .filter((p) => p.status === "active")
        .map((p) => p.id);

      setMyPackages(subscribedPackages);

      if (activePackageIds.length === 0) {
        setUpcomingExamCount(0);
        setLatestVideo(null);
        setIsLoading(false);
        return;
      }

     
      const { data: subjectRows } = await supabase
        .from("subjects")
        .select("id, package_id")
        .in("package_id", activePackageIds);

      if (cancelled) return;

      const subjectIds = (subjectRows ?? []).map((s) => s.id);
      const packageIdBySubjectId = new Map(
        (subjectRows ?? []).map((s) => [s.id, s.package_id]),
      );

      if (subjectIds.length === 0) {
        setUpcomingExamCount(0);
        setLatestVideo(null);
        setIsLoading(false);
        return;
      }

      const [{ count: examCount }, { data: videoRows }] = await Promise.all([
        supabase
          .from("exams")
          .select("id", { count: "exact", head: true })
          .in("subject_id", subjectIds)
          .gt("end_time", new Date().toISOString()),
        supabase
          .from("videos")
          .select("id, title, description, video_url, subject_id")
          .in("subject_id", subjectIds)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      if (cancelled) return;

      setUpcomingExamCount(examCount ?? 0);
      const video = videoRows?.[0] ?? null;
      setLatestVideo(
        video
          ? { ...video, packageId: packageIdBySubjectId.get(video.subject_id) }
          : null,
      );
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    
  }, [profile?.id, profile?.grade_level]);

  const activeCount = myPackages.filter((p) => p.status === "active").length;

  return (
    <div className="min-h-full space-y-8 bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50 p-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
        <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles size={18} className="text-sky-500" />
              <span>أهلاً بك في برنامج التفوق الدراسي</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                مرحبا {profile?.full_name ?? ""}، لنواصل التعلّم اليوم
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                استمتع بمحتوى تعليمي ثري ومتابعة مستمرة لتقدمك في كل باقة.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  الباقات المشترك بها
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {isLoading ? "..." : activeCount}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  الاختبارات القادمة
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {isLoading ? "..." : upcomingExamCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">نظرة سريعة</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">
                  {activeCount > 0
                    ? "استمر في رحلتك التعليمية"
                    : "ابدأ رحلتك التعليمية الآن"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
                <Bell size={22} />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                إجمالي الباقات
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {isLoading ? "..." : myPackages.length}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                عدد الباقات التي اشتركت بها من قبل
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                استكمال التعلم
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                أحدث درس مُضاف
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              <CalendarDays size={18} />
              مفتوح الآن
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-56 w-full rounded-[28px]" />
          ) : latestVideo ? (
            <Link href={`/dashboard/classes/${latestVideo.packageId}`}>
              <VideoLessonCard
                title={latestVideo.title}
                description={latestVideo.description}
                videoUrl={latestVideo.video_url}
              />
            </Link>
          ) : (
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm leading-6 text-slate-600">
                لا توجد دروس متاحة بعد. اشترك في باقة لتبدأ المشاهدة.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">ملخص سريع</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              حالة حسابك
            </h2>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-600">الصف الدراسي</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {profile?.grade_level ?? "—"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-600">الاختبارات القادمة</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {isLoading ? "..." : upcomingExamCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">باقاتي الحالية</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              تابع الباقات التي تعمل عليها
            </h2>
          </div>
          <Link
            href="/dashboard/subscriptions"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            عرض الكل
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-56 w-full rounded-[28px]" />
            ))}
          </div>
        ) : myPackages.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">لم تشترك في أي باقة بعد.</p>
            <Link
              href="/dashboard/subscriptions"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              تصفح الباقات المتاحة
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {myPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                packageId={pkg.id}
                title={pkg.name}
                description={pkg.description}
                status={pkg.status}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
