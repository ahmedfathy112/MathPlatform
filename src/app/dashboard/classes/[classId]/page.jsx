import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Clock3,
  CheckCircle2,
  CalendarDays,
  FileText,
} from "lucide-react";

export default function ClassPage({ params }) {
  const { classId } = params;

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
              صفدرسي
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              الصف {classId}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              نظرة عامة على محتوى الصف، الدروس القادمة، والاختبارات المقررة.
              تصميم يعكس تجربة تعلم متميزة ومريحة.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4 text-center shadow-sm">
              <p className="text-sm text-slate-500">الدروس المكتملة</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">12</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-center shadow-sm">
              <p className="text-sm text-slate-500">الاختبارات المتبقية</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">3</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-center shadow-sm">
              <p className="text-sm text-slate-500">درجة التقدير</p>
              <p className="mt-3 text-2xl font-semibold text-blue-600">87%</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                الدروس القادمة
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                تابع خطة التعلم
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-3xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              <Clock3 size={18} />
              الأسبوع الثاني
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((lesson) => (
              <Link
                key={lesson}
                href={`/dashboard/classes/${classId}/lessons/${lesson}`}
                className="group rounded-[28px] border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-semibold text-slate-900">
                    الدرس {lesson}
                  </span>
                  <ArrowLeft
                    size={20}
                    className="text-slate-400 transition group-hover:text-blue-600"
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  مراجعة أساسية في التكامل والتفاضل مع حلول تفاعلية.
                </p>
              </Link>
            ))}
          </div>
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
              جدول
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">اختبار منتصف الفصل</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    التاريخ: 12 يوليو
                  </h3>
                </div>
                <div className="rounded-3xl bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                  70 دقيقة
                </div>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">مراجعة شاملة</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    قبل الاختبار بـ 3 أيام
                  </h3>
                </div>
                <div className="rounded-3xl bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                  ورشة
                </div>
              </div>
            </div>
          </div>
          <Link
            href={`/dashboard/classes/${classId}/exams/1`}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            عرض تفاصيل الاختبار
          </Link>
        </div>
      </div>
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">ملخص الأداء</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              بيانات تقدمك
            </h2>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
            تحديث تلقائي
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5 text-center shadow-sm">
            <p className="text-sm text-slate-500">نقاط التميز</p>
            <p className="mt-3 text-3xl font-semibold text-blue-600">92</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 text-center shadow-sm">
            <p className="text-sm text-slate-500">الواجبات المنجزة</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">8</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 text-center shadow-sm">
            <p className="text-sm text-slate-500">الوقت المتبقي</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">4 أيام</p>
          </div>
        </div>
      </div>
    </div>
  );
}
