"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowRight, Edit, Plus, Trash2, X, Check } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import { useToast } from "../../../components/ui/ToastProvider";
import { Skeleton } from "../../../components/ui/Skeleton";
import { GRADE_LABELS } from "../../../utils/supabase/adminHelpers";
import { useAuthStore, selectProfile } from "../../../store/useAuthStore";

const emptySubjectForm = {
  id: null,
  name: "",
  description: "",
  is_active: true,
};

function SubjectFormModal({
  initialValues,
  packageId,
  teacherId,
  onClose,
  onSaved,
}) {
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
      description: form.description.trim() || null,
      is_active: form.is_active,
    };

    const { error } = isEditing
      ? await supabase.from("subjects").update(payload).eq("id", form.id)
      : await supabase.from("subjects").insert({
          ...payload,
          package_id: packageId,
          created_by: teacherId,
        });

    setIsSaving(false);

    if (error) {
      showToast({ type: "error", message: "تعذر حفظ المادة." });
      return;
    }

    showToast({
      type: "success",
      message: isEditing ? "تم تحديث المادة." : "تم إضافة المادة إلى الباقة.",
    });
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? "تعديل المادة" : "إضافة مادة جديدة"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              اسم المادة
            </label>
            <input
              value={form.name}
              onChange={updateField("name")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="مثال: الجبر والهندسة الفراغية"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">الوصف</label>
            <textarea
              value={form.description}
              onChange={updateField("description")}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
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

export default function PackageSubjectsPage({ params }) {
  const resolvedParams = use(params);
  const packageId = resolvedParams.packageId;
  const { showToast } = useToast();
  const profile = useAuthStore(selectProfile);

  const [pkg, setPkg] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modalState, setModalState] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    const supabase = createClient();

    const { data: packageRow, error: packageError } = await supabase
      .from("packages")
      .select("id, name, grade_level")
      .eq("id", packageId)
      .maybeSingle();

    if (packageError) {
      showToast({ type: "error", message: "تعذر تحميل بيانات الباقة." });
      setIsLoading(false);
      return;
    }

    if (!packageRow) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setPkg(packageRow);

    const { data: subjectRows, error: subjectsError } = await supabase
      .from("subjects")
      .select("id, name, description, is_active")
      .eq("package_id", packageId)
      .order("name");

    if (subjectsError) {
      showToast({ type: "error", message: "تعذر تحميل مواد الباقة." });
    }

    setSubjects(subjectRows ?? []);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete(subject) {
    if (
      !window.confirm(
        `هل تريد حذف "${subject.name}"؟ سيتم حذف جميع الفيديوهات والاختبارات المرتبطة بها.`,
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-slate-600">هذه الباقة غير موجودة.</p>
        <Link
          href="/admin/packages"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600"
        >
          العودة إلى الباقات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/packages"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowRight size={16} />
          العودة إلى الباقات
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              مواد باقة {pkg.name}
            </h1>
            <p className="mt-1 text-slate-600">
              {GRADE_LABELS[pkg.grade_level] ?? pkg.grade_level}
            </p>
          </div>
          <button
            onClick={() => setModalState(emptySubjectForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <Plus size={20} />
            مادة جديدة
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-slate-600">
            لا توجد مواد في هذه الباقة بعد. أضف أول مادة دراسية.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-right">
              <tr>
                <th className="px-6 py-4 font-semibold">اسم المادة</th>
                <th className="px-6 py-4 font-semibold">الوصف</th>
                <th className="px-6 py-4 font-semibold">الحالة</th>
                <th className="px-6 py-4 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr
                  key={subject.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {subject.name}
                  </td>
                  <td className="px-6 py-4">{subject.description ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        subject.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {subject.is_active ? "نشطة" : "معطلة"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModalState(subject)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-900 transition-colors hover:bg-slate-50"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(subject)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalState ? (
        <SubjectFormModal
          initialValues={modalState}
          packageId={packageId}
          teacherId={profile?.id}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            loadData();
          }}
        />
      ) : null}
    </div>
  );
}
