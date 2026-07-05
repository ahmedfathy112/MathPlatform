"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, Users, X, Check } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { useToast } from "../../components/ui/ToastProvider";
import { Skeleton } from "../../components/ui/Skeleton";
import { GRADE_LABELS } from "../../utils/supabase/adminHelpers";

const GRADE_OPTIONS = Object.entries(GRADE_LABELS);

const emptyForm = {
  id: null,
  name: "",
  grade_level: "secondary_1",
  description: "",
  price_egp: "",
  is_active: true,
};

function SubjectFormModal({ initialValues, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(initialValues.id);

  function updateField(field) {
    return (event) => {
      const value =
        field === "is_active" ? event.target.checked : event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      showToast({ type: "error", message: "يرجى إدخال اسم المادة." });
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      grade_level: form.grade_level,
      description: form.description.trim() || null,
      price_egp: form.price_egp ? Number(form.price_egp) : null,
      is_active: form.is_active,
      created_by: process.env.NEXT_PUBLIC_SUPABASE_TEACHER,
    };

    const { error } = isEditing
      ? await supabase.from("subjects").update(payload).eq("id", form.id)
      : await supabase.from("subjects").insert(payload);

    setIsSaving(false);

    if (error) {
      showToast({ type: "error", message: "تعذر حفظ المادة." });
      return;
    }

    showToast({
      type: "success",
      message: isEditing ? "تم تحديث المادة." : "تم إنشاء المادة الجديدة.",
    });
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEditing ? "تعديل المادة" : "مادة جديدة"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              اسم المادة
            </label>
            <input
              value={form.name}
              onChange={updateField("name")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="مثال: الجبر المتقدم - أولى ثانوي"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              الصف الدراسي
            </label>
            <select
              value={form.grade_level}
              onChange={updateField("grade_level")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {GRADE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              السعر (جنيه)
            </label>
            <input
              type="number"
              value={form.price_egp}
              onChange={updateField("price_egp")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="مثال: 150"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              الوصف
            </label>
            <textarea
              value={form.description}
              onChange={updateField("description")}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={updateField("is_active")}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            مادة نشطة (تظهر للطلاب)
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={18} />
            {isSaving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState(null);

  const loadSubjects = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const [{ data: subjectRows, error }, { data: subscriptionRows }] =
      await Promise.all([
        supabase
          .from("subjects")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("subject_id, status"),
      ]);

    if (error) {
      showToast({ type: "error", message: "تعذر تحميل المواد." });
      setIsLoading(false);
      return;
    }

    const activeCountBySubject = new Map();
    (subscriptionRows ?? []).forEach((row) => {
      if (row.status !== "active") return;
      activeCountBySubject.set(
        row.subject_id,
        (activeCountBySubject.get(row.subject_id) ?? 0) + 1,
      );
    });

    setSubjects(
      (subjectRows ?? []).map((subject) => ({
        ...subject,
        activeStudents: activeCountBySubject.get(subject.id) ?? 0,
      })),
    );
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  async function handleDelete(subject) {
    if (
      !window.confirm(
        `هل أنت متأكد من حذف "${subject.name}"؟ سيتم حذف جميع الفيديوهات والاختبارات المرتبطة بها.`,
      )
    ) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subject.id);

    if (error) {
      showToast({ type: "error", message: "تعذر حذف المادة." });
      return;
    }

    setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
    showToast({ type: "success", message: "تم حذف المادة." });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            إدارة المواد
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            إدارة المواد الدراسية والأسعار وحالة النشر
          </p>
        </div>
        <button
          onClick={() => setModalState(emptyForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          <Plus size={20} />
          مادة جديدة
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-400">
            لا توجد مواد بعد. أنشئ أول مادة دراسية.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {subject.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {GRADE_LABELS[subject.grade_level] ?? subject.grade_level}
                  </p>
                  {subject.price_egp ? (
                    <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {subject.price_egp}
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {" "}
                        ج.م
                      </span>
                    </p>
                  ) : null}
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    subject.is_active
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
                  }`}
                >
                  {subject.is_active ? "نشطة" : "معطلة"}
                </span>
              </div>

              <div className="mb-4 flex items-center gap-2 border-y border-slate-200 py-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
                <Users size={16} />
                <span>{subject.activeStudents} طالب مشترك</span>
              </div>

              {subject.description ? (
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  {subject.description}
                </p>
              ) : null}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalState(subject)}
                  className="flex-1 rounded-lg border border-slate-200 py-2 font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                >
                  <Edit size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(subject)}
                  className="flex-1 rounded-lg border border-red-200 py-2 font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalState ? (
        <SubjectFormModal
          initialValues={modalState}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            loadSubjects();
          }}
        />
      ) : null}
    </div>
  );
}
