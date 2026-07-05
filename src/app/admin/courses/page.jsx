"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle, Trash2, Users, Clock } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { useToast } from "../../components/ui/ToastProvider";
import { Skeleton } from "../../components/ui/Skeleton";
import { GRADE_LABELS } from "../../utils/supabase/adminHelpers";

export default function CoursesPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  const loadSubjects = useCallback(async () => {
    setIsLoadingSubjects(true);
    const supabase = createClient();

    const [{ data: subjectRows, error }, { data: subscriptionRows }] =
      await Promise.all([
        supabase.from("subjects").select("id, name, grade_level").order("name"),
        supabase.from("subscriptions").select("subject_id, status"),
      ]);

    if (error) {
      showToast({ type: "error", message: "تعذر تحميل المواد." });
      setIsLoadingSubjects(false);
      return;
    }

    const activeCountBySubject = new Map();
    (subscriptionRows ?? []).forEach((row) => {
      if (row.status !== "active") return;
      activeCountBySubject.set(
        row.subject_id,
        (activeCountBySubject.get(row.subject_id) ?? 0) + 1,
      );
    });

    const rows = (subjectRows ?? []).map((s) => ({
      ...s,
      activeStudents: activeCountBySubject.get(s.id) ?? 0,
    }));

    setSubjects(rows);
    setIsLoadingSubjects(false);
    if (rows.length > 0 && !activeSubjectId) {
      setActiveSubjectId(rows[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    if (!activeSubjectId) return;
    let cancelled = false;
    const supabase = createClient();

    async function loadVideos() {
      setIsLoadingVideos(true);
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, video_url, order_index")
        .eq("subject_id", activeSubjectId)
        .order("order_index");

      if (cancelled) return;

      if (error) {
        showToast({ type: "error", message: "تعذر تحميل فيديوهات المادة." });
      }

      setVideos(data ?? []);
      setIsLoadingVideos(false);
    }

    loadVideos();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubjectId]);

  async function handleDeleteVideo(videoId) {
    if (!window.confirm("هل تريد حذف هذا الفيديو؟")) return;

    const supabase = createClient();
    const { error } = await supabase.from("videos").delete().eq("id", videoId);

    if (error) {
      showToast({ type: "error", message: "تعذر حذف الفيديو." });
      return;
    }

    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    showToast({ type: "success", message: "تم حذف الفيديو." });
  }

  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            إدارة الدورات
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            تصفح فيديوهات كل مادة، وأضف دروسًا جديدة بسهولة.
          </p>
        </div>
        <Link
          href="/admin/content/upload-video"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02]"
        >
          <PlayCircle size={18} /> إضافة فيديو جديد
        </Link>
      </div>

      {isLoadingSubjects ? (
        <Skeleton className="h-96 w-full rounded-3xl" />
      ) : subjects.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-400">
            لا توجد مواد بعد. أنشئها من صفحة "إدارة المواد" أولًا.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.75fr,0.5fr]">
          <div className="grid gap-6 lg:grid-cols-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setActiveSubjectId(subject.id)}
                className={`group rounded-3xl border p-6 text-right transition ${
                  activeSubjectId === subject.id
                    ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400/40 dark:bg-slate-900"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-400 dark:hover:bg-slate-900"
                }`}
              >
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {GRADE_LABELS[subject.grade_level] ?? subject.grade_level}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {subject.name}
                </h2>
                <div className="mt-6 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users size={16} />
                  <span>{subject.activeStudents} طالب نشط</span>
                </div>
              </button>
            ))}
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  المادة الحالية
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {activeSubject?.name ?? "—"}
                </h2>
              </div>
              <div className="rounded-3xl bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {videos.length} فيديو
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {isLoadingVideos ? (
                <Skeleton className="h-40 w-full rounded-3xl" />
              ) : videos.length === 0 ? (
                <p className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                  لا توجد فيديوهات لهذه المادة بعد.
                </p>
              ) : (
                videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between gap-3 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <PlayCircle size={22} className="text-blue-600" />
                      <p className="font-medium text-slate-900 dark:text-white">
                        {video.title}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="rounded-lg p-2 text-red-500 transition hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
