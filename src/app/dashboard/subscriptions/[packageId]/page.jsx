"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  GraduationCap,
  Hourglass,
} from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import { useAuthStore, selectProfile } from "../../../store/useAuthStore";
import { getEffectiveStatus } from "../../../utils/supabase/queries";
import { useToast } from "../../../components/ui/ToastProvider";
import { Skeleton } from "../../../components/ui/Skeleton";

const GRADE_LABELS = {
  prep_1: "أولى إعدادي",
  prep_2: "ثانية إعدادي",
  prep_3: "ثالثة إعدادي",
  secondary_1: "أولى ثانوي",
  secondary_2: "ثانية ثانوي",
  secondary_3: "ثالثة ثانوي",
};

function StatusBanner({ status, pendingPaymentRequest }) {
  if (status === "active") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
        <BadgeCheck size={20} />
        <p className="text-sm font-medium">
          اشتراكك في هذه المادة فعّال حاليًا.
        </p>
      </div>
    );
  }

  if (status === "pending" || pendingPaymentRequest) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
        <Hourglass size={20} />
        <p className="text-sm font-medium">
          طلب اشتراكك قيد المراجعة من الإدارة، سيتم تفعيله في أقرب وقت.
        </p>
      </div>
    );
  }

  if (status === "suspended") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
        تم إيقاف اشتراكك في هذه المادة. يرجى التواصل مع الدعم الفني.
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
        انتهى اشتراكك في هذه المادة. جدّده للاستمرار في الوصول للدروس
        والاختبارات.
      </div>
    );
  }

  return null;
}

export default function PackageDetailPage({ params }) {
  const resolvedParams = use(params);
  const subjectId = resolvedParams.packageId;
  const profile = useAuthStore(selectProfile);
  const { showToast } = useToast();

  const [subject, setSubject] = useState(null);
  const [status, setStatus] = useState(null);
  const [pendingPaymentRequest, setPendingPaymentRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!profile?.id || !subjectId) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);
      setNotFound(false);

      const { data: subjectRow, error: subjectError } = await supabase
        .from("subjects")
        .select("id, name, description, grade_level, price_egp")
        .eq("id", subjectId)
        .maybeSingle();

      if (cancelled) return;

      if (subjectError) {
        showToast({ type: "error", message: "تعذر تحميل بيانات المادة." });
        setIsLoading(false);
        return;
      }

      if (!subjectRow) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setSubject(subjectRow);

      const [{ data: subscriptionRow }, { data: paymentRequestRow }] =
        await Promise.all([
          supabase
            .from("subscriptions")
            .select("status, expires_at")
            .eq("student_id", profile.id)
            .eq("subject_id", subjectId)
            .maybeSingle(),
          supabase
            .from("payment_requests")
            .select("id, status, created_at")
            .eq("student_id", profile.id)
            .eq("subject_id", subjectId)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

      if (cancelled) return;

      setStatus(getEffectiveStatus(subscriptionRow));
      setPendingPaymentRequest(paymentRequestRow ?? null);
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, subjectId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full rounded-[32px]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          هذه المادة غير متاحة
        </h2>
        <Link
          href="/dashboard/subscriptions"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          العودة إلى الاشتراكات
        </Link>
      </div>
    );
  }

  const canSubscribeOrRenew =
    status !== "active" &&
    status !== "pending" &&
    status !== "suspended" &&
    !pendingPaymentRequest;

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
            باقة اشتراك
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {subject.name}
          </h1>
          {subject.description ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              {subject.description}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <GraduationCap size={16} />
              {GRADE_LABELS[subject.grade_level] ?? subject.grade_level}
            </span>
            {subject.price_egp ? (
              <span className="inline-flex items-center gap-2">
                <Clock3 size={16} />
                {subject.price_egp} جنيه / اشتراك
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <StatusBanner
        status={status}
        pendingPaymentRequest={pendingPaymentRequest}
      />

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        {status === "active" ? (
          <Link
            href={`/dashboard/classes/${subjectId}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            دخول للمادة
            <ArrowLeft size={16} />
          </Link>
        ) : canSubscribeOrRenew ? (
          <Link
            href={`/dashboard/subscriptions/${subjectId}/checkout`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {status === "expired" ? "تجديد الاشتراك" : "اشترك الآن"}
            <ArrowLeft size={16} />
          </Link>
        ) : (
          <p className="text-sm text-slate-500">
            لا يوجد إجراء متاح حاليًا لهذه المادة.
          </p>
        )}
      </div>
    </div>
  );
}
