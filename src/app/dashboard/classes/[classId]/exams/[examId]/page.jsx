import {
  ClipboardList,
  ShieldCheck,
  Clock3,
  FileText,
  BookOpen,
} from "lucide-react";

export default function ExamPage({ params }) {
  const { classId, examId } = params;

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
              اختبار قادم
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {examId} - الصف {classId}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              تحضير شامل للاختبار مع ملخص الأداء وتعليمات التنفيذ. هذه الصفحة
              تعرض محتوى القياسات التجريبية بطريقة بسيطة وجذابة.
            </p>
          </div>
          <div className="rounded-[28px] bg-slate-50 p-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <ShieldCheck size={20} />
              <span className="text-sm font-semibold">آمن ومحدد</span>
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">التاريخ</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  12 يوليو 2026
                </p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-500">المدة</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  70 دقيقة
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">نظرة عامة</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                تعليمات ما قبل الامتحان
              </h2>
            </div>
            <div className="rounded-3xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              هام
            </div>
          </div>
          <div className="space-y-4">
            {[
              "راجع الأسئلة السابقة لضمان فهمك العميق.",
              "تأكد من توزيع الوقت بشكل متوازن بين الأقسام.",
              "استخدم الملخص السريع قبل دخول الامتحان.",
            ].map((note) => (
              <div
                key={note}
                className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4"
              >
                <div className="mt-1 rounded-full bg-blue-600 p-2 text-white">
                  <BookOpen size={16} />
                </div>
                <p className="text-sm leading-6 text-slate-600">{note}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">أقسام الامتحان</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  الأسئلة النظرية والتطبيقية
                </p>
              </div>
              <div className="rounded-3xl bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                15 سؤال
              </div>
            </div>
          </div>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-700">
            بدء الامتحان الآن
          </button>
        </div>
        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">ملخص سريع</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                أداء متوقع
              </h2>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              تقدير
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "الدقة المتوقعة", value: "88%" },
              { label: "وقت المراجعة المقترح", value: "45 دقيقة" },
              { label: "مستوى الاستعداد", value: "عالي" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3 text-slate-700">
              <FileText size={18} />
              <div>
                <p className="text-sm font-semibold">ملف الأسئلة</p>
                <p className="text-xs text-slate-500">
                  متاح قبل الامتحان بساعة
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
