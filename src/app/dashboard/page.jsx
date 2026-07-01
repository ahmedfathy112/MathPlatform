import Link from "next/link";
import PackageCard from "../../components/PackageCard";
import VideoLessonCard from "../../components/VideoLessonCard";
import { Sparkles, Bell, CalendarDays } from "lucide-react";

const packages = [
  {
    title: "رياضة بحتة - أولى ثانوي",
    status: "active",
    imagePlaceholder: "أولى ثانوي",
    actionLabel: "دخول للمادة",
  },
  {
    title: "تفاضل وتكامل - ثانية ثانوي",
    status: "pending",
    imagePlaceholder: "ثانية ثانوي",
    actionLabel: "في انتظار المراجعة",
  },
  {
    title: "هندسة تفاضلية - ثانية ثانوي",
    status: "active",
    imagePlaceholder: "ثانية ثانوي",
    actionLabel: "دخول للمادة",
  },
];

export default function DashboardPage() {
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
                مرحبا يوسف، لنواصل التعلّم اليوم
              </h1>
              <p className="max-w-xl text-sm text-slate-200 sm:text-base">
                استمتع بمحتوى تعليمي ثري، تخطيط أسبوعي ذكي، وتوصيات مخصصة بحسب
                تقدمك.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-4 text-sm sm:p-5">
                <p className="text-sm text-slate-200">عدد الدروس المنجزة</p>
                <p className="mt-2 text-2xl font-semibold">18</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 text-sm sm:p-5">
                <p className="text-sm text-slate-200">الاختبارات القادمة</p>
                <p className="mt-2 text-2xl font-semibold">3</p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] bg-white/10 p-6 shadow-lg shadow-slate-950/10 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 text-slate-100">
              <div>
                <p className="text-sm">الرحلة الحالية</p>
                <p className="mt-2 text-xl font-semibold">تفاضل وتكامل</p>
              </div>
              <div className="rounded-3xl bg-white/15 p-3">
                <Bell size={22} />
              </div>
            </div>
            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl bg-white/10 p-5 text-slate-100">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-200">
                  نسبة الإنجاز
                </p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-3/4 rounded-full bg-blue-400 transition-all" />
                </div>
                <p className="mt-3 text-sm font-semibold">75% مكتمل</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-4 text-slate-100">
                  <p className="text-sm">المادة الحالية</p>
                  <p className="mt-2 text-lg font-semibold">رياضة بحتة</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4 text-slate-100">
                  <p className="text-sm">أداء الأسبوع</p>
                  <p className="mt-2 text-lg font-semibold">ممتاز</p>
                </div>
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
                أحدث درس تابعته
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              <CalendarDays size={18} />
              مفتوح الآن
            </div>
          </div>
          <VideoLessonCard />
        </div>
        <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-sm shadow-slate-200/40 transition hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">ملخص سريع</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                التقدم في باقاتك
              </h2>
            </div>
            <div className="rounded-3xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              مستمر
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">درس هذا الأسبوع</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                حل معادلات تفاضلية
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">الوقت المتبقي للامتحان</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                5 أيام
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
            href="/dashboard/packages"
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            عرض الكل
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((item) => (
            <PackageCard
              key={item.title}
              title={item.title}
              status={item.status}
              imagePlaceholder={item.imagePlaceholder}
              actionLabel={item.actionLabel}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
