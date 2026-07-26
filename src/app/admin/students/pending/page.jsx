"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, CheckCircle, Phone, Wallet, XCircle } from "lucide-react";
import { createClient } from "../../../utils/supabase/client";
import { useToast } from "../../../components/ui/ToastProvider";
import { Skeleton } from "../../../components/ui/Skeleton";
import { formatDateTime } from "../../../utils/supabase/adminHelpers";

const APPROVAL_DURATION_DAYS = 30;

export default function PendingStudentsPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    // Plain fetch + client-side merge on purpose, not an embedded-relationship
    // select: payment_requests has two FKs into profiles (student_id and
    // reviewed_by), and PostgREST's disambiguation hint syntax proved
    // version-dependent against this project's setup.
    const { data: requestRows, error } = await supabase
      .from("payment_requests")
      .select("id, amount_claimed, whatsapp_reference, created_at, student_id, package_id")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      showToast({ type: "error", message: "تعذر تحميل الطلبات المعلقة." });
      setIsLoading(false);
      return;
    }

    const rows = requestRows ?? [];
    const studentIds = [...new Set(rows.map((r) => r.student_id))];
    const packageIds = [...new Set(rows.map((r) => r.package_id))];

    const [{ data: studentRows }, { data: packageRows }] = await Promise.all([
      studentIds.length
        ? supabase.from("profiles").select("id, full_name, phone").in("id", studentIds)
        : Promise.resolve({ data: [] }),
      packageIds.length
        ? supabase.from("packages").select("id, name").in("id", packageIds)
        : Promise.resolve({ data: [] }),
    ]);

    const studentById = new Map((studentRows ?? []).map((s) => [s.id, s]));
    const packageById = new Map((packageRows ?? []).map((p) => [p.id, p]));

    setRequests(
      rows.map((row) => ({
        ...row,
        student: studentById.get(row.student_id) ?? null,
        package: packageById.get(row.package_id) ?? null,
      })),
    );
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function handleApprove(requestId) {
    setProcessingId(requestId);
    const supabase = createClient();

    const { error } = await supabase.rpc("approve_payment_request", {
      p_payment_request_id: requestId,
      p_duration_days: APPROVAL_DURATION_DAYS,
    });

    setProcessingId(null);

    if (error) {
      showToast({ type: "error", message: "تعذر اعتماد الطلب." });
      return;
    }

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    showToast({
      type: "success",
      message: `تم تفعيل الاشتراك لمدة ${APPROVAL_DURATION_DAYS} يومًا.`,
    });
  }

  async function handleReject(requestId) {
    setProcessingId(requestId);
    const supabase = createClient();

    const { error } = await supabase.rpc("reject_payment_request", {
      p_payment_request_id: requestId,
    });

    setProcessingId(null);

    if (error) {
      showToast({ type: "error", message: "تعذر رفض الطلب." });
      return;
    }

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    showToast({ type: "info", message: "تم رفض الطلب." });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          الطلاب المعلقين
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          راجع طلبات الدفع المعلقة واعتمدها لتفعيل الاشتراك مباشرة.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          عدد الطلبات المعلقة
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          {isLoading ? "..." : requests.length}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-3xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-400">
            لا توجد طلبات معلقة حاليًا. 🎉
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {request.student?.full_name ?? "طالب"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    اشتراك في باقة: {request.package?.name ?? "—"}
                  </p>
                </div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  قيد المراجعة
                </span>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 dark:border-slate-700">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Phone size={16} />
                  <span dir="ltr">{request.student?.phone ?? "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Wallet size={16} />
                  <span>
                    {request.amount_claimed
                      ? `${request.amount_claimed} ج.م`
                      : "—"}{" "}
                    — رقم العملية: {request.whatsapp_reference ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Clock size={16} />
                  <span>تم التقديم {formatDateTime(request.created_at)}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => handleApprove(request.id)}
                  disabled={processingId === request.id}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle size={16} />
                  اعتمد الطلب ({APPROVAL_DURATION_DAYS} يومًا)
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  disabled={processingId === request.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                >
                  <XCircle size={16} />
                  رفض الطلب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
