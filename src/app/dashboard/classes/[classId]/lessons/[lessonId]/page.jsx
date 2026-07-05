"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Lock,
  PlayCircle,
} from "lucide-react";
import { createClient } from "../../../../../utils/supabase/client";
import { Skeleton } from "../../../../../components/ui/Skeleton";

function isEmbedUrl(url) {
  return (
    typeof url === "string" &&
    (url.includes("iframe") ||
      url.includes("embed") ||
      url.includes("youtube.com"))
  );
}

export default function LessonPage({ params }) {
  const resolvedParams = use(params);
  const { classId: subjectId, lessonId: videoId } = resolvedParams;

  const [video, setVideo] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);
      setNotFound(false);

      // RLS (has_active_subscription) means this simply returns no row if
      // the student isn't subscribed to this subject, rather than an error.
      const { data: videoRow, error: videoError } = await supabase
        .from("videos")
        .select("id, title, description, video_url, subject_id")
        .eq("id", videoId)
        .maybeSingle();

      if (cancelled) return;

      if (videoError || !videoRow) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setVideo(videoRow);

      const { data: attachmentRows } = await supabase
        .from("attachments")
        .select("id, title, file_url")
        .eq("video_id", videoId);

      if (cancelled) return;

      setAttachments(attachmentRows ?? []);
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-[32px]" />
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Skeleton className="h-96 w-full rounded-[32px]" />
          <Skeleton className="h-64 w-full rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Lock size={24} />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          هذا الدرس غير متاح
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          إما أن الدرس غير موجود، أو أنك لا تملك اشتراكًا فعّالًا في هذه المادة.
        </p>
        <Link
          href={`/dashboard/classes/${subjectId}`}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          العودة إلى المادة
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
            درس
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {video.title}
          </h1>
          {video.description ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              {video.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">عرض الدرس</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                محتوى مرئي
              </h2>
            </div>
            <PlayCircle size={22} className="text-blue-600" />
          </div>
          <div className="mt-6 overflow-hidden rounded-[28px] bg-slate-950">
            <div className="aspect-video bg-black">
              {isEmbedUrl(video.video_url) ? (
                <iframe
                  className="h-full w-full"
                  src={video.video_url}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  className="h-full w-full"
                  src={video.video_url}
                  controls
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-[28px] bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">الموارد</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  مرفقات الدرس
                </h2>
              </div>
              <FileText size={20} className="text-blue-600" />
            </div>
            <div className="mt-5 space-y-3">
              {attachments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  لا توجد مرفقات لهذا الدرس.
                </p>
              ) : (
                attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                        <ClipboardList size={16} />
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {attachment.title}
                      </p>
                    </div>
                    <span className="rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
                      تحميل
                    </span>
                  </a>
                ))
              )}
            </div>
          </div>

          <Link
            href={`/dashboard/classes/${subjectId}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={18} />
            العودة إلى المادة
          </Link>
        </div>
      </div>
    </div>
  );
}
