"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { BookOpen, Lock } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import { useAuthStore, selectUser } from "../../../store/useAuthStore";
import {
  usePlatformStore,
  selectHasActiveAccess,
} from "../../../store/usePlatformStore";
import { fetchSubjectsForPackage } from "../../../utils/supabase/queries";
import { useToast } from "../../../components/ui/ToastProvider";
import { Skeleton } from "../../../components/ui/Skeleton";

/** Shown while a student has no active subscription for this package yet. */
function NoAccessState({ packageName }) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Lock size={24} />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">
        لا يوجد اشتراك فعّال{" "}
        {packageName ? `في "${packageName}"` : "في هذه الباقة"}
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

export default function PackagePage({ params }) {
  const resolvedParams = use(params);
  const packageId = resolvedParams.packageId;

  const user = useAuthStore(selectUser);
  const setSelectedPackage = usePlatformStore((state) => state.setSelectedPackage);
  const setSubscription = usePlatformStore((state) => state.setSubscription);
  const setLoadingSubscription = usePlatformStore(
    (state) => state.setLoadingSubscription,
  );
  const pkg = usePlatformStore((state) => state.selectedPackage);
  const hasActiveAccess = usePlatformStore(selectHasActiveAccess);
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user?.id || !packageId) {
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);
      setNotFound(false);
      setLoadingSubscription(true);

      const [
        { data: packageRow, error: packageError },
        { data: subscriptionRow },
      ] = await Promise.all([
        supabase
          .from("packages")
          .select("id, name, grade_level, description")
          .eq("id", packageId)
          .maybeSingle(),
        supabase
          .from("subscriptions")
          .select("status, expires_at")
          .eq("student_id", user.id)
          .eq("package_id", packageId)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      if (packageError) {
        showToast({ type: "error", message: "تعذر تحميل بيانات الباقة." });
        setIsLoading(false);
        setLoadingSubscription(false);
        return;
      }

      if (!packageRow) {
        setNotFound(true);
        setIsLoading(false);
        setLoadingSubscription(false);
        return;
      }

      setSelectedPackage(packageRow);
      setSubscription(subscriptionRow);

      const isActive =
        subscriptionRow?.status === "active" &&
        (!subscriptionRow.expires_at ||
          new Date(subscriptionRow.expires_at) > new Date());

      if (!isActive) {
        setSubjects([]);
        setIsLoading(false);
        return;
      }

      // RLS also enforces this subscription check server-side
      // (has_active_subscription, via the subject's package), so this query
      // simply returns an empty set if access is ever revoked mid-session —
      // this client-side check just avoids an unnecessary round trip.
      const { subjects: subjectRows, error: subjectsError } =
        await fetchSubjectsForPackage(supabase, packageId);

      if (cancelled) return;

      if (subjectsError) {
        showToast({ type: "error", message: subjectsError });
      }

      setSubjects(subjectRows);
      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, packageId, setSelectedPackage, setSubscription, setLoadingSubscription]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-40 w-full rounded-[32px]" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-56 w-full rounded-[32px]" />
          <Skeleton className="h-56 w-full rounded-[32px]" />
          <Skeleton className="h-56 w-full rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          هذه الباقة غير موجودة
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
            باقة دراسية
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {pkg?.name ?? "الباقة"}
          </h1>
          {pkg?.description ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              {pkg.description}
            </p>
          ) : null}
        </div>
      </div>

      {!hasActiveAccess ? (
        <NoAccessState packageName={pkg?.name} />
      ) : subjects.length === 0 ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-600">
            لا توجد مواد منشورة في هذه الباقة بعد.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/dashboard/classes/${packageId}/${subject.id}`}
              className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <BookOpen size={22} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {subject.name}
              </h3>
              {subject.description ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {subject.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
