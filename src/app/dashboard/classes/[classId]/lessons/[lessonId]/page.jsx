import {
  BookOpenText,
  PlayCircle,
  ClipboardList,
  FileText,
  ArrowLeft,
} from "lucide-react";

export default function LessonPage({ params }) {
  const { classId, lessonId } = params;

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
              درس مفصل
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              الدرس {lessonId} - الصف {classId}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              درس غني بالعناصر المرئية والملخصات السريعة. صممناه لمساعدتك على
              التركيز والوصول إلى نتائج أفضل.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5 text-center shadow-sm">
              <p className="text-sm text-slate-500">المدة</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                28 دقيقة
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 text-center shadow-sm">
              <p className="text-sm text-slate-500">الموارد</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">4</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 text-center shadow-sm">
              <p className="text-sm text-slate-500">التقدم</p>
              <p className="mt-3 text-2xl font-semibold text-blue-600">46%</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">عرض الدرس</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                محتوى مرئي تفاعلي
              </h2>
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              <PlayCircle size={18} />
              تشغيل الدرس
            </button>
          </div>
          <div className="mt-6 overflow-hidden rounded-[28px] bg-slate-950">
            <div className="aspect-video bg-black" />
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-[28px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">ملخص الدرس</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                سنتعرف على تطبيقات التكامل في حل المسائل الهندسية وتمثيل النتائج
                بطريقة مبسطة وسلسة.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "الموضوع الأول: التكامل المحدود",
                "الموضوع الثاني: قواعد الاشتقاق",
                "الموضوع الثالث: أمثلة تطبيقية",
                "الموضوع الرابع: مراجعة سريعة",
              ].map((item) => (
                <div key={item} className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
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
              {["ملخص الدرس PDF", "أسئلة تدريبية", "مذكرة مراجعة سريعة"].map(
                (resource) => (
                  <div
                    key={resource}
                    className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                        <ClipboardList size={16} />
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {resource}
                      </p>
                    </div>
                    <button className="rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">
                      تحميل
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="rounded-[28px] bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              الملاحظات السريعة
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>استخدم الملخص قبل المراجعة النهائية.</li>
              <li>راجع الأمثلة التدربية مرتين لتحسين الفهم.</li>
              <li>اكمل الدرس التالي بعد إنهاء المادة الحالية.</li>
            </ul>
          </div>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-blue-700">
            <ArrowLeft size={18} />
            الانتقال إلى الدرس التالي
          </button>
        </div>
      </div>
    </div>
  );
}
