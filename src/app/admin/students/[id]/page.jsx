"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Phone,
  ShieldOff,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import { useToast } from "../../../components/ui/ToastProvider";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  GRADE_LABELS,
  formatDate,
  formatDateTime,
} from "../../../utils/supabase/adminHelpers";
import ImageLightbox from "../../../components/ui/ImageLightbox";

const SUBSCRIPTION_STATUS_LABELS = {
  pending: "معلق",
  active: "نشط",
  suspended: "موقوف",
  expired: "منتهي",
};

const SUBSCRIPTION_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-rose-100 text-rose-700",
  expired: "bg-slate-100 text-slate-600",
};

const PAYMENT_STATUS_LABELS = {
  pending: "معلق",
  approved: "مقبول",
  rejected: "مرفوض",
};

const PAYMENT_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const ATTEMPT_STATUS_LABELS = {
  in_progress: "قيد التنفيذ",
  submitted: "تم التسليم",
  auto_submitted: "تسليم تلقائي (انتهى الوقت)",
};

const ATTEMPT_STATUS_STYLES = {
  in_progress: "bg-blue-100 text-blue-700",
  submitted: "bg-emerald-100 text-emerald-700",
  auto_submitted: "bg-amber-100 text-amber-700",
};

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function StudentProfilePage({ params }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  const { showToast } = useToast();

  const [student, setStudent] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [examAttempts, setExamAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [processingBan, setProcessingBan] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);
      setNotFound(false);

      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, grade_level, is_banned, created_at")
        .eq("id", studentId)
        .eq("role", "student")
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        showToast({ type: "error", message: "تعذر تحميل بيانات الطالب." });
        setIsLoading(false);
        return;
      }

      if (!profileRow) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setStudent(profileRow);

      // Every remaining query is a plain fetch + client-side merge rather
      // than an embedded-relationship select — payment_requests in
      // particular has two FKs into profiles (student_id and reviewed_by),
      // which makes PostgREST's embed syntax ambiguous/version-dependent
      // in this project. Fetching flat and merging by id sidesteps that
      // entirely, same pattern used across the rest of the admin/assistant
      // dashboards.
      const [
        { data: subscriptionRows, error: subsError },
        { data: paymentRows, error: paymentsError },
        { data: attemptRows, error: attemptsError },
      ] = await Promise.all([
        supabase
          .from("subscriptions")
          .select(
            "id, package_id, status, activated_at, expires_at, created_at",
          )
          .eq("student_id", studentId)
          .order("created_at", { ascending: false }),
        supabase
          .from("payment_requests")
          .select(
            "id, package_id, amount_claimed, whatsapp_reference, status, created_at, reviewed_at",
          )
          .eq("student_id", studentId)
          .order("created_at", { ascending: false }),
        supabase
          .from("exam_attempts")
          .select("id, exam_id, status, started_at, submitted_at, score")
          .eq("student_id", studentId)
          .order("started_at", { ascending: false }),
      ]);

      if (cancelled) return;

      if (subsError || paymentsError || attemptsError) {
        showToast({ type: "error", message: "تعذر تحميل بعض بيانات الطالب." });
      }

      const packageIds = [
        ...new Set([
          ...(subscriptionRows ?? []).map((r) => r.package_id),
          ...(paymentRows ?? []).map((r) => r.package_id),
        ]),
      ];
      const examIds = [...new Set((attemptRows ?? []).map((r) => r.exam_id))];

      const [{ data: packageRows }, { data: examRows }] = await Promise.all([
        packageIds.length
          ? supabase.from("packages").select("id, name").in("id", packageIds)
          : Promise.resolve({ data: [] }),
        examIds.length
          ? supabase.from("exams").select("id, title").in("id", examIds)
          : Promise.resolve({ data: [] }),
      ]);

      if (cancelled) return;

      const packageById = new Map((packageRows ?? []).map((p) => [p.id, p]));
      const examById = new Map((examRows ?? []).map((e) => [e.id, e]));

      setSubscriptions(
        (subscriptionRows ?? []).map((row) => ({
          ...row,
          package: packageById.get(row.package_id) ?? null,
        })),
      );
      setPaymentRequests(
        (paymentRows ?? []).map((row) => ({
          ...row,
          package: packageById.get(row.package_id) ?? null,
        })),
      );
      setExamAttempts(
        (attemptRows ?? []).map((row) => ({
          ...row,
          exam: examById.get(row.exam_id) ?? null,
        })),
      );
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  async function handleToggleBan() {
    if (!student) return;
    setProcessingBan(true);
    const supabase = createClient();
    const nextBanned = !student.is_banned;

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: nextBanned })
      .eq("id", student.id);

    setProcessingBan(false);

    if (error) {
      showToast({ type: "error", message: "تعذر تحديث حالة الطالب." });
      return;
    }

    setStudent((prev) => ({ ...prev, is_banned: nextBanned }));
    showToast({
      type: nextBanned ? "info" : "success",
      message: nextBanned ? "تم حظر الطالب." : "تم رفع الحظر عن الطالب.",
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-slate-600">هذا الطالب غير موجود.</p>
        <Link
          href="/admin/students/all"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600"
        >
          العودة إلى قائمة الطلاب
        </Link>
      </div>
    );
  }

  const submittedAttempts = examAttempts.filter(
    (a) => a.status === "submitted" || a.status === "auto_submitted",
  );
  const averageScore =
    submittedAttempts.length > 0
      ? Math.round(
          submittedAttempts.reduce((sum, a) => sum + Number(a.score || 0), 0) /
            submittedAttempts.length,
        )
      : null;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/students/all"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowRight size={16} />
          العودة إلى قائمة الطلاب
        </Link>
      </div>

      {/* General details */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {student.full_name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Phone size={15} />
                <span dir="ltr">{student.phone}</span>
              </span>
              <span>
                {GRADE_LABELS[student.grade_level] ??
                  student.grade_level ??
                  "—"}
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar size={15} />
                انضم في {formatDate(student.created_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                student.is_banned
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {student.is_banned ? "محظور" : "نشط"}
            </span>
            <button
              onClick={handleToggleBan}
              disabled={processingBan}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                student.is_banned
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              {student.is_banned ? (
                <ShieldCheck size={14} />
              ) : (
                <ShieldOff size={14} />
              )}
              {student.is_banned ? "رفع الحظر" : "حظر الطالب"}
            </button>
          </div>
        </div>

        {averageScore !== null ? (
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5 text-sm">
            <span className="text-slate-500">
              متوسط الدرجات في {submittedAttempts.length} اختبار
            </span>
            <span className="text-lg font-bold text-slate-900">
              {averageScore}%
            </span>
          </div>
        ) : null}
      </div>

      {/* Subscriptions */}
      <SectionCard
        title="سجل الاشتراكات"
        subtitle="كل باقة اشترك بها الطالب على مر الوقت"
      >
        {subscriptions.length === 0 ? (
          <p className="text-sm text-slate-500">
            لا يوجد سجل اشتراكات لهذا الطالب.
          </p>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {sub.package?.name ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {sub.activated_at
                      ? `فُعّل في ${formatDate(sub.activated_at)}`
                      : `أُنشئ في ${formatDate(sub.created_at)}`}
                    {sub.expires_at
                      ? ` — ينتهي في ${formatDate(sub.expires_at)}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    SUBSCRIPTION_STATUS_STYLES[sub.status] ??
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {SUBSCRIPTION_STATUS_LABELS[sub.status] ?? sub.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Payment history */}
      <SectionCard
        title="سجل المدفوعات"
        subtitle="كل طلبات الدفع المرسلة من الطالب"
      >
        {paymentRequests.length === 0 ? (
          <p className="text-sm text-slate-500">
            لا توجد طلبات دفع لهذا الطالب.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 text-right dark:border-slate-700">
                <tr>
                  <th className="px-3 py-3 font-semibold">الباقة</th>
                  <th className="px-3 py-3 font-semibold">المبلغ</th>
                  {/* <th className="px-3 py-3 font-semibold">الإيصال</th> */}
                  <th className="px-3 py-3 font-semibold">الحالة</th>
                  <th className="px-3 py-3 font-semibold">تاريخ الطلب</th>
                </tr>
              </thead>
              <tbody>
                {paymentRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-3 py-3">
                      {request.package?.name ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      {request.amount_claimed
                        ? `${request.amount_claimed} ج.م`
                        : "—"}
                    </td>
                    {/* <td className="px-3 py-3">
                      <button
                        onClick={() =>
                          handleViewReceipt(request.receipt_image_path)
                        }
                        disabled={!request.receipt_image_path}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200"
                      >
                        <ImageIcon size={13} />
                        عرض
                      </button>
                    </td> */}
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          PAYMENT_STATUS_STYLES[request.status] ??
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[request.status] ??
                          request.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {formatDateTime(request.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Exam archive */}
      <SectionCard
        title="سجل الاختبارات"
        subtitle="كل محاولة اختبار قام بها الطالب"
      >
        {examAttempts.length === 0 ? (
          <p className="text-sm text-slate-500">
            لم يخض هذا الطالب أي اختبار بعد.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-right">
                <tr>
                  <th className="px-3 py-3 font-semibold">الاختبار</th>
                  <th className="px-3 py-3 font-semibold">تاريخ الأداء</th>
                  <th className="px-3 py-3 font-semibold">الدرجة</th>
                  <th className="px-3 py-3 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {examAttempts.map((attempt) => (
                  <tr
                    key={attempt.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {attempt.exam?.title ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {formatDateTime(attempt.started_at)}
                    </td>
                    <td className="px-3 py-3">
                      {attempt.score !== null ? (
                        <span className="font-semibold text-slate-900">
                          {attempt.score}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          ATTEMPT_STATUS_STYLES[attempt.status] ??
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {attempt.status === "in_progress" ? (
                          <Clock size={12} />
                        ) : attempt.status === "submitted" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {ATTEMPT_STATUS_LABELS[attempt.status] ??
                          attempt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {lightboxSrc ? (
        <ImageLightbox
          src={lightboxSrc}
          alt="إيصال الدفع"
          onClose={() => setLightboxSrc(null)}
        />
      ) : null}
    </div>
  );
}
