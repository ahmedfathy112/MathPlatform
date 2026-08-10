"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Users, BookOpen, X, Check } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { useToast } from "../../components/ui/ToastProvider";
import { Skeleton } from "../../components/ui/Skeleton";
import { GRADE_LABELS } from "../../utils/supabase/adminHelpers";
import { useAuthStore, selectProfile } from "../../store/useAuthStore";

const GRADE_OPTIONS = Object.entries(GRADE_LABELS);

const emptyForm = {
  id: null,
  name: "",
  grade_level: "secondary_1",
  description: "",
  price_egp: "",
  is_active: true,
};

function PackageFormModal({ initialValues, teacherId, onClose, onSaved }) {
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
      showToast({ type: "error", message: "يرجى إدخال اسم الباقة." });
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
    };

    const { error } = isEditing
      ? await supabase.from("packages").update(payload).eq("id", form.id)
      : await supabase
          .from("packages")
          .insert({ ...payload, created_by: teacherId });

    setIsSaving(false);

    if (error) {
      showToast({ type: "error", message: "تعذر حفظ الباقة." });
      return;
    }

    showToast({
      type: "success",
      message: isEditing ? "تم تحديث الباقة." : "تم إنشاء الباقة الجديدة.",
    });
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? "تعديل الباقة" : "باقة جديدة"}
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
              اسم الباقة (السنة الدراسية)
            </label>
            <input
              value={form.name}
              onChange={updateField("name")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="مثال: باقة الصف الثاني الثانوي"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              الصف الدراسي
            </label>
            <select
              value={form.grade_level}
              onChange={updateField("grade_level")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {GRADE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              السعر (جنيه)
            </label>
            <input
              type="number"
              value={form.price_egp}
              onChange={updateField("price_egp")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="مثال: 500"
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
            باقة نشطة (تظهر للطلاب)
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
  const profile = useAuthStore(selectProfile);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState(null);

  const loadPackages = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const [
      { data: packageRows, error },
      { data: subjectRows },
      { data: subscriptionRows },
    ] = await Promise.all([
      supabase
        .from("packages")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("subjects").select("id, package_id"),
      supabase.from("subscriptions").select("package_id, status"),
    ]);

    if (error) {
      showToast({ type: "error", message: "تعذر تحميل الباقات." });
      setIsLoading(false);
      return;
    }

    const subjectCountByPackage = new Map();
    (subjectRows ?? []).forEach((row) => {
      if (!row.package_id) return;
      subjectCountByPackage.set(
        row.package_id,
        (subjectCountByPackage.get(row.package_id) ?? 0) + 1,
      );
    });

    const activeCountByPackage = new Map();
    (subscriptionRows ?? []).forEach((row) => {
      if (row.status !== "active") return;
      activeCountByPackage.set(
        row.package_id,
        (activeCountByPackage.get(row.package_id) ?? 0) + 1,
      );
    });

    setPackages(
      (packageRows ?? []).map((pkg) => ({
        ...pkg,
        subjectCount: subjectCountByPackage.get(pkg.id) ?? 0,
        activeStudents: activeCountByPackage.get(pkg.id) ?? 0,
      })),
    );
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  async function handleDelete(pkg) {
    if (
      !window.confirm(
        `هل أنت متأكد من حذف "${pkg.name}"؟ سيتم حذف جميع المواد والفيديوهات والاختبارات المرتبطة بها.`,
      )
    ) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("packages").delete().eq("id", pkg.id);

    if (error) {
      showToast({ type: "error", message: "تعذر حذف الباقة." });
      return;
    }

    setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
    showToast({ type: "success", message: "تم حذف الباقة." });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">إدارة الباقات</h1>
          <p className="mt-1 text-slate-600">
            كل باقة تمثل سنة دراسية كاملة، وتحتوي على مجموعة من المواد
          </p>
        </div>
        <button
          onClick={() => setModalState(emptyForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          <Plus size={20} />
          باقة جديدة
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-slate-600">
            لا توجد باقات بعد. أنشئ أول باقة (سنة دراسية).
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {pkg.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {GRADE_LABELS[pkg.grade_level] ?? pkg.grade_level}
                  </p>
                  {pkg.price_egp ? (
                    <p className="mt-1 text-2xl font-bold text-blue-600">
                      {pkg.price_egp}
                      <span className="text-sm text-slate-600"> ج.م</span>
                    </p>
                  ) : null}
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    pkg.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {pkg.is_active ? "نشطة" : "معطلة"}
                </span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 border-y border-slate-200 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span>{pkg.subjectCount} مادة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{pkg.activeStudents} مشترك</span>
                </div>
              </div>

              {pkg.description ? (
                <p className="mb-4 text-sm text-slate-600">{pkg.description}</p>
              ) : null}

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/packages/${pkg.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <BookOpen size={15} />
                  إدارة المواد
                </Link>
                <button
                  onClick={() => setModalState(pkg)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-900 transition-colors hover:bg-slate-50"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(pkg)}
                  className="rounded-lg border border-red-200 p-2 text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalState ? (
        <PackageFormModal
          initialValues={modalState}
          teacherId={profile?.id}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            loadPackages();
          }}
        />
      ) : null}
    </div>
  );
}
