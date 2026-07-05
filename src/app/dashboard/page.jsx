"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, Sparkles } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { useAuthStore, selectProfile } from "../store/useAuthStore";
import { fetchSubjectsWithSubscriptions } from "../utils/supabase/queries";
import { useToast } from "../components/ui/ToastProvider";
import { Skeleton } from "../components/ui/Skeleton";
import PackageCard from "../components/PackageCard";
import VideoLessonCard from "../components/VideoLessonCard";

export default function DashboardPage() {
  const profile = useAuthStore(selectProfile);
  const { showToast } = useToast();

  const [mySubjects, setMySubjects] = useState([]); // subjects with any subscription history
  const [upcomingExamCount, setUpcomingExamCount] = useState(0);
  const [latestVideo, setLatestVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);

      const { subjects, error } = await fetchSubjectsWithSubscriptions(
        supabase,
        profile,
      );

      if (cancelled) return;

      if (error) {
        showToast({ type: "error", message: error });
        setIsLoading(false);
        return;
      }

      const subscribedSubjects = subjects.filter((s) => s.status !== null);
      const activeSubjectIds = subjects
        .filter((s) => s.status === "active")
        .map((s) => s.id);

      setMySubjects(subscribedSubjects);

      if (activeSubjectIds.length === 0) {
        setUpcomingExamCount(0);
        setLatestVideo(null);
        setIsLoading(false);
        return;
      }

      const [{ count: examCount }, { data: videoRows }] = await Promise.all([
        supabase
          .from("exams")
          .select("id", { count: "exact", head: true })
          .in("subject_id", activeSubjectIds)
          .gt("end_time", new Date().toISOString()),
        supabase
          .from("videos")
          .select("id, title, description, video_url, subject_id")
          .in("subject_id", activeSubjectIds)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      if (cancelled) return;

      setUpcomingExamCount(examCount ?? 0);
      setLatestVideo(videoRows?.[0] ?? null);
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.grade_level]);

  const activeCount = mySubjects.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-blue-700 to-sky-500 px-6 py-8 text-white shadow-md">
        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={18} />
              <span>أهلاً بك في برنامج التفوق الدراسي</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                مرحبا {profile?.full_name ?? ""}، لنواصل التعلّم اليوم
              </h1>
              <p className="max-w-xl text-sm text-slate-200 sm:text-base">
                استمتع بمحتوى تعليمي ثري ومتابعة مستمرة لتقدمك في كل مادة.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-4 text-sm sm:p-5">
                <p className="text-sm text-slate-200">المواد المشترك بها</p>
                <p className="mt-2 text-2xl font-semibold">
                  {isLoading ? "..." : activeCount}
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 text-sm sm:p-5">
                <p className="text-sm text-slate-200">الاختبارات القادمة</p>
                <p className="mt-2 text-2xl font-semibold">
                  {isLoading ? "..." : upcomingExamCount}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] bg-white/10 p-6 shadow-lg shadow-slate-950/10 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 text-slate-100">
              <div>
                <p className="text-sm">نظرة سريعة</p>
                <p className="mt-2 text-xl font-semibold">
                  {activeCount > 0
                    ? "استمر في رحلتك التعليمية"
                    : "ابدأ رحلتك التعليمية الآن"}
                </p>
              </div>
              <div className="rounded-3xl bg-white/15 p-3">
                <Bell size={22} />
              </div>
            </div>
            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl bg-white/10 p-5 text-slate-100">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-200">
                  إجمالي المواد
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  {isLoading ? "..." : mySubjects.length}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  عدد المواد التي اشتركت بها من قبل
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-sm shadow-slate-200/40 transition hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
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
            <Link
              href={`/dashboard/classes/${latestVideo.subject_id}/lessons/${latestVideo.id}`}
            >
              <VideoLessonCard
                title={latestVideo.title}
                description={latestVideo.description}
                videoUrl={latestVideo.video_url}
              />
            </Link>
          ) : (
            <p className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-600">
              لا توجد دروس متاحة بعد. اشترك في مادة لتبدأ المشاهدة.
            </p>
          )}
        </div>

        <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-sm shadow-slate-200/40 transition hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">ملخص سريع</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                حالة حسابك
              </h2>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">الصف الدراسي</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {profile?.grade_level ?? "—"}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">الاختبارات القادمة</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {isLoading ? "..." : upcomingExamCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-[28px] bg-white p-6 shadow-sm shadow-slate-200/40 transition hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">باقاتي الحالية</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              تابع الحزم التي تعمل عليها
            </h2>
          </div>
          <Link
            href="/dashboard/subscriptions"
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            عرض الكل
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-56 w-full rounded-3xl" />
            ))}
          </div>
        ) : mySubjects.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">لم تشترك في أي مادة بعد.</p>
            <Link
              href="/dashboard/subscriptions"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              تصفح المواد المتاحة
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mySubjects.map((subject) => (
              <PackageCard
                key={subject.id}
                subjectId={subject.id}
                title={subject.name}
                description={subject.description}
                status={subject.status}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
