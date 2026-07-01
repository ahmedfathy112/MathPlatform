import { Play } from "lucide-react";

export default function VideoLessonCard() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="overflow-hidden rounded-[28px] bg-slate-950">
        <div className="aspect-video bg-black">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/0Q_0p2nlxB8"
            title="تفاضل وتكامل - الحصة الأولى"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-900">
            تفاضل وتكامل - الحصة الأولى
          </p>
          <p className="text-sm text-slate-500">المدة: 29 دقيقة</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <Play size={16} />
          تحميل الملزمة PDF
        </button>
      </div>
    </div>
  );
}
