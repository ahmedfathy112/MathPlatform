"use client";

import { useState } from "react";
import {
  Plus,
  CalendarDays,
  Clock,
  FileText,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const defaultQuestion = { id: 1, text: "سؤال نموذجي للطلاب", points: 5 };

export default function CreateExamPage() {
  const [exam, setExam] = useState({
    title: "اختبار مراجعة الفصل الأول",
    course: "الجبر المتقدم",
    duration: 90,
    totalQuestions: 5,
    weight: 20,
    startDate: "2024-08-10",
    status: "نشط",
  });
  const [questions, setQuestions] = useState([defaultQuestion]);
  const [submitted, setSubmitted] = useState(false);

  const handleExamChange = (field) => (event) => {
    const value =
      field === "duration" || field === "totalQuestions" || field === "weight"
        ? Number(event.target.value)
        : event.target.value;
    setExam((prev) => ({ ...prev, [field]: value }));
    setSubmitted(false);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: prev.length + 1, text: "سؤال جديد...", points: 5 },
    ]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, [field]: value } : question,
      ),
    );
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            إنشاء امتحان جديد
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            صمم امتحانًا متكاملاً مع أسئلة ووزن درجات واضح.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02]">
          <FileText size={18} /> حفظ المسودة
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr,0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="grid gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                عنوان الامتحان
              </label>
              <input
                type="text"
                value={exam.title}
                onChange={handleExamChange("title")}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  الدورة
                </label>
                <select
                  value={exam.course}
                  onChange={handleExamChange("course")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                >
                  <option>الجبر المتقدم</option>
                  <option>الهندسة التحليلية</option>
                  <option>التحليل والتفاضل</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  الحالة
                </label>
                <select
                  value={exam.status}
                  onChange={handleExamChange("status")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                >
                  <option>نشط</option>
                  <option>مسودة</option>
                  <option>معطل</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  المدة (دقائق)
                </label>
                <input
                  type="number"
                  value={exam.duration}
                  onChange={handleExamChange("duration")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  عدد الأسئلة
                </label>
                <input
                  type="number"
                  value={exam.totalQuestions}
                  onChange={handleExamChange("totalQuestions")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  الوزن (%)
                </label>
                <input
                  type="number"
                  value={exam.weight}
                  onChange={handleExamChange("weight")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  تاريخ البدء
                </label>
                <input
                  type="date"
                  value={exam.startDate}
                  onChange={handleExamChange("startDate")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                />
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <CalendarDays size={18} />
                  <p>البدء في: {exam.startDate}</p>
                </div>
                <div className="mt-4 flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <Clock size={18} />
                  <p>المدة: {exam.duration} دقيقة</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  أسئلة الامتحان
                </h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  <Plus size={16} /> إضافة سؤال
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="grid gap-4 sm:grid-cols-[1fr,120px]">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          سؤال #{question.id}
                        </label>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(event) =>
                            updateQuestion(
                              question.id,
                              "text",
                              event.target.value,
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          العلامات
                        </label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(event) =>
                            updateQuestion(
                              question.id,
                              "points",
                              Number(event.target.value),
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              <CheckCircle size={18} /> إنشاء الامتحان
            </button>
          </div>
          {submitted && (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-200">
              <p className="font-semibold">تم إنشاء الاختبار بنجاح!</p>
              <p className="mt-2">
                يمكنك الآن مراقبة أداء الطلاب ومراجعة الإجابات من لوحة التحكم.
              </p>
            </div>
          )}
        </form>

        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">جودة الأسئلة</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  احرص على التوازن بين الأسئلة السهلة والمتوسطة والصعبة.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              نصائح لإنشاء اختبار مثالي
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <ArrowRight size={18} className="mt-1 text-blue-500" /> اختر
                صياغة واضحة للأسئلة.
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight size={18} className="mt-1 text-blue-500" /> وزع
                العلامات بشكل عادل على المحتوى.
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight size={18} className="mt-1 text-blue-500" /> تأكد من
                وجود شرح لما بعد الاختبار.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
