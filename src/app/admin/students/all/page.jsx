"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, ShieldOff, ShieldCheck } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import { useToast } from "../../../components/ui/ToastProvider";
import { Skeleton } from "../../../components/ui/Skeleton";
import { GRADE_LABELS, formatDate } from "../../../utils/supabase/adminHelpers";

const STATUS_FILTERS = [
  { key: "all", label: "الكل" },
  { key: "active", label: "نشط" },
  { key: "banned", label: "موقوف" },
];

const GRADE_FILTERS = [
  { key: "all", label: "كل الصفوف" },
  ...Object.entries(GRADE_LABELS).map(([value, label]) => ({
    key: value,
    label,
  })),
];

export default function AllStudentsPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const [
      { data: profileRows, error: profilesError },
      { data: subscriptionRows },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, phone, grade_level, is_banned, created_at")
        .eq("role", "student")
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("student_id, package_id")
        .eq("status", "active"),
    ]);

    if (profilesError) {
      showToast({ type: "error", message: "تعذر تحميل قائمة الطلاب." });
      setIsLoading(false);
      return;
    }

    const packageIds = [
      ...new Set((subscriptionRows ?? []).map((r) => r.package_id)),
    ];
    const { data: packageRows } = packageIds.length
      ? await supabase.from("packages").select("id, name").in("id", packageIds)
      : { data: [] };

    const packageById = new Map((packageRows ?? []).map((p) => [p.id, p]));

    const packagesByStudent = new Map();
    (subscriptionRows ?? []).forEach((row) => {
      const list = packagesByStudent.get(row.student_id) ?? [];
      list.push(packageById.get(row.package_id)?.name);
      packagesByStudent.set(row.student_id, list);
    });

    setStudents(
      (profileRows ?? []).map((profile) => ({
        ...profile,
        activePackages: packagesByStudent.get(profile.id) ?? [],
      })),
    );
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      if (!isActive) return;
      await loadStudents();
    };

    run();

    return () => {
      isActive = false;
    };
  }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = [student.full_name, student.phone]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "banned" ? student.is_banned : !student.is_banned);

      const matchesGrade =
        gradeFilter === "all" || student.grade_level === gradeFilter;

      return matchesSearch && matchesStatus && matchesGrade;
    });
  }, [students, search, statusFilter, gradeFilter]);

  async function handleToggleBan(student) {
    setProcessingId(student.id);
    const supabase = createClient();
    const nextBanned = !student.is_banned;

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: nextBanned })
      .eq("id", student.id);

    setProcessingId(null);

    if (error) {
      showToast({ type: "error", message: "تعذر تحديث حالة الطالب." });
      return;
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id ? { ...s, is_banned: nextBanned } : s,
      ),
    );
    showToast({
      type: "success",
      message: nextBanned ? "تم إيقاف الطالب." : "تم إعادة تفعيل الطالب.",
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">جميع الطلاب</h1>
        <p className="mt-1 text-slate-600">
          راجع كافة الطلاب وحالتهم، وافتح ملف أي طالب لعرض التفاصيل الكاملة.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr,280px] lg:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute inset-y-0 right-4 my-auto text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث عن اسم طالب أو رقم هاتف..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {STATUS_FILTERS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setStatusFilter(option.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    statusFilter === option.key
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {GRADE_FILTERS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setGradeFilter(option.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    gradeFilter === option.key
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-3xl" />
      ) : (
        <div className="w-full flex flex-row flex-wrap gap-4 max-md:flex-col">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="w-[30%] rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(37,99,235,0.08)] max-md:w-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-sm">
                    {student.full_name?.charAt(0) ?? "؟"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-slate-900">
                      {student.full_name?.split(" ").slice(0, 2).join(" ") ||
                        "غير محدد"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500" dir="ltr">
                      {student.phone}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    student.is_banned
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {student.is_banned ? "موقوف" : "نشط"}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">الصف</span>
                  <span className="font-semibold text-slate-700">
                    {GRADE_LABELS[student.grade_level] ??
                      student.grade_level ??
                      "—"}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="mt-2 text-xs leading-6 text-slate-600">
                    {student.activePackages.length > 0
                      ? student.activePackages.join(" • ")
                      : "لا يوجد باقات نشطة"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">تاريخ الانضمام</span>
                  <span className="font-semibold text-slate-700">
                    {formatDate(student.created_at)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/students/${student.id}`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  التفاصيل
                  <ChevronLeft size={13} />
                </Link>

                <button
                  onClick={() => handleToggleBan(student)}
                  disabled={processingId === student.id}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    student.is_banned
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  {student.is_banned ? (
                    <>
                      <ShieldCheck size={14} /> تفعيل
                    </>
                  ) : (
                    <>
                      <ShieldOff size={14} /> إيقاف
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              لا يوجد طلاب مطابقون لهذا البحث.
            </div>
          ) : null}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-slate-500">
          عدد الطلاب المعروضين
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {isLoading ? "..." : filteredStudents.length}
        </p>
      </div>
    </div>
  );
}
