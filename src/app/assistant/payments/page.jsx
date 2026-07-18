"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Search } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import { useToast } from "../../components/ui/ToastProvider";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDateTime } from "../../utils/supabase/adminHelpers";
import ImageLightbox from "../../components/ui/ImageLightbox";

const STATUS_FILTERS = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "معلق" },
  { key: "approved", label: "مقبول" },
  { key: "rejected", label: "مرفوض" },
];

const STATUS_STYLES = {
  pending: "bg-amber-500/15 text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-rose-500/15 text-rose-300",
};

const STATUS_LABELS = {
  pending: "معلق",
  approved: "مقبول",
  rejected: "مرفوض",
};

export default function AssistantPaymentsPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    async function loadRequests() {
      const { data: paymentRows, error } = await supabase
        .from("payment_requests")
        .select(
          "id, status, amount_claimed, whatsapp_reference, receipt_image_path, created_at, reviewed_at, student_id, subject_id",
        )
        .order("created_at", { ascending: false });

      if (ignore) return;

      if (error) {
        showToast({ type: "error", message: "تعذر تحميل سجل المدفوعات." });
        setIsLoading(false);
        return;
      }

      const rows = paymentRows ?? [];
      const studentIds = [...new Set(rows.map((row) => row.student_id))];
      const subjectIds = [...new Set(rows.map((row) => row.subject_id))];

      const [{ data: studentRows }, { data: subjectRows }] = await Promise.all([
        studentIds.length
          ? supabase
              .from("profiles")
              .select("id, full_name, phone")
              .in("id", studentIds)
          : Promise.resolve({ data: [] }),
        subjectIds.length
          ? supabase.from("subjects").select("id, name").in("id", subjectIds)
          : Promise.resolve({ data: [] }),
      ]);

      if (ignore) return;

      const studentById = new Map((studentRows ?? []).map((s) => [s.id, s]));
      const subjectById = new Map((subjectRows ?? []).map((s) => [s.id, s]));

      setRequests(
        rows.map((row) => ({
          ...row,
          student: studentById.get(row.student_id) ?? null,
          subject: subjectById.get(row.subject_id) ?? null,
        })),
      );
      setIsLoading(false);
    }

    // No setIsLoading(true) here on purpose — `isLoading` already starts
    // `true` from useState above, so setting it again synchronously as the
    // effect fires is exactly the "setState synchronously within an effect"
    // pattern React was warning about. setIsLoading(false) below still
    // happens, but only after the `await`, i.e. asynchronously — that's fine.
    loadRequests();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleViewReceipt(path) {
    if (!path) return;
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("payment-receipts")
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      showToast({ type: "error", message: "تعذر تحميل صورة الإيصال." });
      return;
    }

    setLightboxSrc(data.signedUrl);
  }

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesSearch =
        !query ||
        [request.student?.full_name, request.student?.phone]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, search]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">سجل المدفوعات</h1>
        <p className="mt-1 text-slate-400">
          سجل كامل لكل طلبات الاشتراك، بغض النظر عن حالتها
        </p>
      </div>

      {pendingCount > 0 ? (
        <Link
          href="/assistant/students"
          className="block rounded-2xl border border-amber-400/20 bg-amber-500/5 px-5 py-3 text-sm text-amber-200 transition-all duration-300 hover:border-amber-400/40"
        >
          يوجد {pendingCount} طلب معلق بانتظار المراجعة — اذهب إلى صفحة الطلاب
          لاعتمادها
        </Link>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-sm">
          <Search
            size={18}
            className="pointer-events-none absolute inset-y-0 right-4 my-auto text-slate-500"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-white outline-none backdrop-blur-md transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.key}
              onClick={() => setStatusFilter(option.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                statusFilter === option.key
                  ? "bg-gradient-to-l from-indigo-600 to-violet-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.35)]"
                  : "border border-white/10 bg-slate-900/80 text-slate-300 hover:bg-white/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-3xl bg-slate-800/60" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-md">
          <table className="min-w-full text-sm text-slate-300">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4 text-right font-semibold">الطالب</th>
                <th className="px-6 py-4 text-right font-semibold">المادة</th>
                <th className="px-6 py-4 text-right font-semibold">المبلغ</th>
                <th className="px-6 py-4 text-right font-semibold">الإيصال</th>
                <th className="px-6 py-4 text-right font-semibold">الحالة</th>
                <th className="px-6 py-4 text-right font-semibold">
                  تاريخ الطلب
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">
                      {request.student?.full_name ?? "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500" dir="ltr">
                      {request.student?.phone ?? "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {request.subject?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {request.amount_claimed
                      ? `${request.amount_claimed} ج.م`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        handleViewReceipt(request.receipt_image_path)
                      }
                      disabled={!request.receipt_image_path}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ImageIcon size={14} />
                      عرض
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_STYLES[request.status] ??
                        "bg-white/5 text-slate-300"
                      }`}
                    >
                      {STATUS_LABELS[request.status] ?? request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {formatDateTime(request.created_at)}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    لا توجد طلبات مطابقة.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

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
