"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Image as ImageIcon,
  Phone,
  RotateCcw,
  Search,
  ShieldOff,
  Wallet,
  XCircle,
} from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { useToast } from "../../components/ui/ToastProvider";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDateTime } from "../../utils/supabase/adminHelpers";
import ImageLightbox from "../../components/ui/ImageLightbox";
import ResetExamAttemptModal from "../../components/assistant/ResetExamAttemptModal";

const APPROVAL_DURATION_DAYS = 30;

/* ---------------------------------------------------------------------- */
/* Pending approvals                                                      */
/* ---------------------------------------------------------------------- */

function PendingApprovalsSection() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("payment_requests")
      .select(
        "id, amount_claimed, whatsapp_reference, created_at, student:student_id(id, full_name, phone), subject:subject_id(id, name)",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      showToast({ type: "error", message: "تعذر تحميل الطلبات المعلقة." });
      setIsLoading(false);
      return;
    }

    setRequests(data ?? []);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function handleApprove(request) {
    setProcessingId(request.id);
    // Optimistic: remove immediately, roll back on failure.
    setRequests((prev) => prev.filter((r) => r.id !== request.id));

    const supabase = createClient();
    const { error } = await supabase.rpc("approve_payment_request", {
      p_payment_request_id: request.id,
      p_duration_days: APPROVAL_DURATION_DAYS,
    });

    setProcessingId(null);

    if (error) {
      setRequests((prev) => [request, ...prev]);
      showToast({ type: "error", message: "تعذر اعتماد الطلب." });
      return;
    }

    showToast({
      type: "success",
      message: `تم تفعيل اشتراك ${request.student?.full_name ?? "الطالب"} لمدة ${APPROVAL_DURATION_DAYS} يومًا.`,
    });
  }

  async function handleReject(request) {
    setProcessingId(request.id);
    setRequests((prev) => prev.filter((r) => r.id !== request.id));

    const supabase = createClient();
    const { error } = await supabase.rpc("reject_payment_request", {
      p_payment_request_id: request.id,
    });

    setProcessingId(null);

    if (error) {
      setRequests((prev) => [request, ...prev]);
      showToast({ type: "error", message: "تعذر رفض الطلب." });
      return;
    }

    showToast({ type: "info", message: "تم رفض الطلب." });
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">الطلاب المعلقون</h2>
          <p className="mt-1 text-sm text-slate-400">
            راجع إيصال الدفع واعتمد الطلب أو ارفضه
          </p>
        </div>
        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-1.5 text-sm font-semibold text-amber-300">
          {isLoading ? "..." : requests.length} طلب
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-56 w-full rounded-3xl bg-slate-800/60"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center text-slate-400 backdrop-blur-md">
          لا توجد طلبات معلقة حاليًا. 🎉
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-md transition-all duration-300 hover:border-amber-400/20 hover:shadow-[0_0_25px_rgba(250,204,21,0.1)]"
            >
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() =>
                    request.receiptSignedUrl &&
                    setLightboxSrc(request.receiptSignedUrl)
                  }
                  disabled={!request.receiptSignedUrl}
                  className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 disabled:cursor-not-allowed"
                >
                  {request.receiptSignedUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={request.receiptSignedUrl}
                        alt="إيصال الدفع"
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                        <ImageIcon size={18} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-white">
                    {request.student?.full_name ?? "طالب"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {request.subject?.name ?? "—"}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Phone size={13} />
                    <span dir="ltr">{request.student?.phone ?? "—"}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <Wallet size={13} />
                    <span>
                      {request.amount_claimed
                        ? `${request.amount_claimed} ج.م`
                        : "—"}
                      {request.whatsapp_reference
                        ? ` • ${request.whatsapp_reference}`
                        : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {formatDateTime(request.created_at)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => handleApprove(request)}
                  disabled={processingId === request.id}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-all duration-300 hover:bg-emerald-500/25 hover:shadow-[0_0_18px_rgba(52,211,153,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  قبول
                </button>
                <button
                  onClick={() => handleReject(request)}
                  disabled={processingId === request.id}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500/15 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-all duration-300 hover:bg-rose-500/25 hover:shadow-[0_0_18px_rgba(244,63,94,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={16} />
                  رفض
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxSrc ? (
        <ImageLightbox
          src={lightboxSrc}
          alt="إيصال الدفع"
          onClose={() => setLightboxSrc(null)}
        />
      ) : null}
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Search & actions on active students                                    */
/* ---------------------------------------------------------------------- */

function StudentSearchSection() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmingBanId, setConfirmingBanId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [resetModalStudent, setResetModalStudent] = useState(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, is_banned")
      .eq("role", "student")
      .order("full_name");

    if (error) {
      showToast({ type: "error", message: "تعذر تحميل قائمة الطلاب." });
      setIsLoading(false);
      return;
    }

    setStudents(data ?? []);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      [student.full_name, student.phone]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [students, search]);

  async function handleConfirmBan(student) {
    setProcessingId(student.id);
    const supabase = createClient();
    const nextBanned = !student.is_banned;

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: nextBanned })
      .eq("id", student.id);

    setProcessingId(null);
    setConfirmingBanId(null);

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
      type: nextBanned ? "info" : "success",
      message: nextBanned ? "تم حظر الطالب." : "تم رفع الحظر عن الطالب.",
    });
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">بحث وإجراءات</h2>
        <p className="mt-1 text-sm text-slate-400">
          ابحث عن طالب لحظر حسابه أو إعادة تعيين محاولة اختبار
        </p>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute inset-y-0 right-4 my-auto text-slate-500"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 pr-12 text-sm text-white outline-none backdrop-blur-md transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full rounded-3xl bg-slate-800/60" />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-md">
          <table className="min-w-full text-sm text-slate-300">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4 text-right font-semibold">الطالب</th>
                <th className="px-6 py-4 text-right font-semibold">الحالة</th>
                <th className="px-6 py-4 text-right font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">
                      {student.full_name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500" dir="ltr">
                      {student.phone}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        student.is_banned
                          ? "bg-rose-500/15 text-rose-300"
                          : "bg-emerald-500/15 text-emerald-300"
                      }`}
                    >
                      {student.is_banned ? "محظور" : "نشط"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {confirmingBanId === student.id ? (
                        <>
                          <span className="text-xs text-slate-400">
                            تأكيد {student.is_banned ? "رفع الحظر" : "الحظر"}؟
                          </span>
                          <button
                            onClick={() => handleConfirmBan(student)}
                            disabled={processingId === student.id}
                            className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/30"
                          >
                            تأكيد
                          </button>
                          <button
                            onClick={() => setConfirmingBanId(null)}
                            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
                          >
                            إلغاء
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmingBanId(student.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition-all duration-300 hover:bg-rose-500/20 hover:shadow-[0_0_14px_rgba(244,63,94,0.3)]"
                        >
                          <ShieldOff size={14} />
                          {student.is_banned ? "رفع الحظر" : "حظر الطالب"}
                        </button>
                      )}

                      <button
                        onClick={() => setResetModalStudent(student)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition-all duration-300 hover:bg-violet-500/20 hover:shadow-[0_0_14px_rgba(139,92,246,0.3)]"
                      >
                        <RotateCcw size={14} />
                        إعادة محاولة الامتحان
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    لا يوجد طلاب مطابقون لهذا البحث.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {resetModalStudent ? (
        <ResetExamAttemptModal
          student={resetModalStudent}
          onClose={() => setResetModalStudent(null)}
        />
      ) : null}
    </section>
  );
}

/* ---------------------------------------------------------------------- */

export default function AssistantStudentsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-white">إدارة الطلاب</h1>
        <p className="mt-1 text-slate-400">
          مراجعة طلبات الاشتراك ومتابعة حسابات الطلاب
        </p>
      </div>
      <PendingApprovalsSection />
      <StudentSearchSection />
    </div>
  );
}
