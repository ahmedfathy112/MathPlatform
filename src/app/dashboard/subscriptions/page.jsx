"use client";

export default function SubscriptionsPage() {
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

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center dark:border-slate-700 dark:bg-slate-800">
        <p className="text-slate-600 dark:text-slate-400">
          لا توجد اشتراكات حالية
        </p>
      </div>
    </div>
  );
}
