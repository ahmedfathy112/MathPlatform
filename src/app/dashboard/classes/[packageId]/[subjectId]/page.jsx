"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, Clock3, Lock } from "lucide-react";
import { createClient } from "../../../../utils/supabase/client";
import { useAuthStore, selectUser } from "../../../../store/useAuthStore";
import { useToast } from "../../../../components/ui/ToastProvider";
import { Skeleton } from "../../../../components/ui/Skeleton";
import VideoLessonCard from "../../../../components/VideoLessonCard";

function formatExamDate(isoString) {
  return new Date(isoString).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function NoAccessState({ packageId }) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Lock size={24} />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">
        لا يوجد اشتراك فعّال في هذه الباقة
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        اشترك في هذه الباقة أو تواصل مع المسؤول لتفعيل حسابك حتى تتمكن من
        مشاهدة الدروس والاختبارات الخاصة بها.
      </p>
      <Link
        href="/dashboard/subscriptions"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        عرض باقات الاشتراك
      </Link>
    </div>
  );
}

export default function SubjectPage({ params }) {
  const resolvedParams = use(params);
  const packageId = resolvedParams.packageId;
  const subjectId = resolvedParams.subjectId;

  const user = useAuthStore(selectUser);
  const { showToast } = useToast();

  const [subject, setSubject] = useState(null);
  const [videos, setVideos] = useState([]);
  const [exams, setExams] = useState([]);
  const [hasActiveAccess, setHasActiveAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user?.id || !packageId || !subjectId) return;

    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);
      setNotFound(false);

      // A student could deep-link straight to a subject URL without going
      // through the package grid first, so access is re-checked here rather
      // than assumed from wherever they navigated from.
      const [
        { data: subjectRow, error: subjectError },
        { data: subscriptionRow },
      ] = await Promise.all([
        supabase
          .from("subjects")
          .select("id, name, description, package_id")
          .eq("id", subjectId)
          .maybeSingle(),
        supabase
          .from("subscriptions")
          .select("status, expires_at")
          .eq("student_id", user.id)
          .eq("package_id", packageId)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      if (subjectError) {
        showToast({ type: "error", message: "تعذر تحميل بيانات المادة." });
        setIsLoading(false);
        return;
      }

      if (!subjectRow || subjectRow.package_id !== packageId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setSubject(subjectRow);

      const isActive =
        subscriptionRow?.status === "active" &&
        (!subscriptionRow.expires_at ||
          new Date(subscriptionRow.expires_at) > new Date());

      setHasActiveAccess(isActive);

      if (!isActive) {
        setVideos([]);
        setExams([]);
        setIsLoading(false);
        return;
      }

      // RLS also enforces this subscription check server-side
      // (has_active_subscription, via the subject's package), so these
      // queries simply return empty sets if access is ever revoked
      // mid-session — this client-side check just avoids an unnecessary
      // round trip.
      const [{ data: videoRows }, { data: examRows }] = await Promise.all([
        supabase
          .from("videos")
          .select("id, title, description, video_url, order_index")
          .eq("subject_id", subjectId)
          .order("order_index"),
        supabase
          .from("exams")
          .select("id, title, start_time, end_time, duration_minutes")
          .eq("subject_id", subjectId)
          .order("start_time"),
      ]);

      if (cancelled) return;

      setVideos(videoRows ?? []);
      setExams(examRows ?? []);
      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, packageId, subjectId]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-40 w-full rounded-[32px]" />
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Skeleton className="h-72 w-full rounded-[32px]" />
          <Skeleton className="h-72 w-full rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          هذه المادة غير موجودة
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <Link
          href={`/dashboard/classes/${packageId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowRight size={16} />
          العودة إلى مواد الباقة
        </Link>
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
            مادة دراسية
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {subject?.name ?? "المادة"}
          </h1>
          {subject?.description ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              {subject.description}
            </p>
          ) : null}
        </div>
      </div>

      {!hasActiveAccess ? (
        <NoAccessState packageId={packageId} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">الدروس</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  فيديوهات المادة
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <BookOpen size={18} />
                {videos.length} درس
              </div>
            </div>

            {videos.length === 0 ? (
              <p className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
                لا توجد دروس منشورة حتى الآن لهذه المادة.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {videos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/dashboard/classes/${packageId}/${subjectId}/lessons/${video.id}`}
                  >
                    <VideoLessonCard
                      title={video.title}
                      description={video.description}
                      videoUrl={video.video_url}
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  الاختبارات المقررة
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  مواعيد قادمة
                </h2>
              </div>
              <div className="rounded-3xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <CalendarDays size={18} />
              </div>
            </div>

            {exams.length === 0 ? (
              <p className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
                لا توجد اختبارات مجدولة حاليًا.
              </p>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/dashboard/classes/${packageId}/${subjectId}/exams/${exam.id}`}
                    className="block rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:border-blue-200 hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">{exam.title}</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">
                          {formatExamDate(exam.start_time)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 rounded-3xl bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                        <Clock3 size={14} />
                        {exam.duration_minutes} دقيقة
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
