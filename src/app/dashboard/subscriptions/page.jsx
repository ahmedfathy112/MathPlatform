"use client";

import { useEffect, useState } from "react";
import { PackageOpen } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { useAuthStore, selectProfile } from "../../store/useAuthStore";
import { fetchSubjectsWithSubscriptions } from "../../utils/supabase/queries";
import { useToast } from "../../components/ui/ToastProvider";
import { PackageCardSkeleton } from "../../components/ui/Skeleton";
import PackageCard from "../../components/PackageCard";

export default function SubscriptionsPage() {
  const profile = useAuthStore(selectProfile);
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);
      const { subjects: rows, error } = await fetchSubjectsWithSubscriptions(
        supabase,
        profile,
      );

      if (cancelled) return;

      if (error) {
        showToast({ type: "error", message: error });
      }

      setSubjects(rows);
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, profile?.grade_level]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          الاشتراكات
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          إدارة اشتراكاتك في الباقات
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <PackageCardSkeleton key={index} />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700">
            <PackageOpen size={22} />
          </div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            لا توجد مواد متاحة لصفك الدراسي حاليًا.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
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
    </div>
  );
}
