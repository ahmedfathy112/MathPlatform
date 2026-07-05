"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Copy, Loader2, Smartphone, Wallet } from "lucide-react";
import { createClient } from "../../../../utils/supabase/client";
import { useAuthStore, selectProfile } from "../../../../store/useAuthStore";
import { getEffectiveStatus } from "../../../../utils/supabase/queries";
import { useToast } from "../../../../components/ui/ToastProvider";
import { Skeleton } from "../../../../components/ui/Skeleton";

const VODAFONE_CASH_NUMBER =
  process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER || "01060733679";

const paymentRequestSchema = z.object({
  amountClaimed: z
    .string()
    .trim()
    .min(1, "يرجى إدخال المبلغ المدفوع")
    .refine((value) => Number(value) > 0, "يرجى إدخال مبلغ صحيح"),
  whatsappReference: z
    .string()
    .trim()
    .min(3, "يرجى إدخال رقم العملية أو رقم الهاتف الذي تم الدفع منه"),
});

export default function CheckoutPage({ params }) {
  const resolvedParams = use(params);

  const subjectId = resolvedParams.packageId;
  const profile = useAuthStore(selectProfile);
  const { showToast } = useToast();

  const [subject, setSubject] = useState(null);
  const [existingStatus, setExistingStatus] = useState(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(paymentRequestSchema),
    mode: "onTouched",
    defaultValues: { amountClaimed: "", whatsappReference: "" },
  });

  useEffect(() => {
    if (!profile?.id || !subjectId) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setIsLoading(true);

      const [
        { data: subjectRow },
        { data: subscriptionRow },
        { data: pendingRow },
      ] = await Promise.all([
        supabase
          .from("subjects")
          .select("id, name, price_egp")
          .eq("id", subjectId)
          .maybeSingle(),
        supabase
          .from("subscriptions")
          .select("status, expires_at")
          .eq("student_id", profile.id)
          .eq("subject_id", subjectId)
          .maybeSingle(),
        supabase
          .from("payment_requests")
          .select("id")
          .eq("student_id", profile.id)
          .eq("subject_id", subjectId)
          .eq("status", "pending")
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      setSubject(subjectRow);
      setExistingStatus(getEffectiveStatus(subscriptionRow));
      setHasPendingRequest(Boolean(pendingRow));
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, subjectId]);

  async function handleCopyNumber() {
    try {
      await navigator.clipboard.writeText(VODAFONE_CASH_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: "error", message: "تعذر نسخ الرقم." });
    }
  }

  const onSubmit = async ({ amountClaimed, whatsappReference }) => {
    const supabase = createClient();

    const { error } = await supabase.from("payment_requests").insert({
      student_id: profile.id,
      subject_id: subjectId,
      amount_claimed: Number(amountClaimed),
      whatsapp_reference: whatsappReference,
    });

    if (error) {
      showToast({
        type: "error",
        message: "تعذر إرسال طلب الاشتراك. حاول مرة أخرى.",
      });
      return;
    }

    setIsSubmitted(true);
    showToast({
      type: "success",
      message: "تم إرسال طلبك بنجاح، سيتم مراجعته قريبًا.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full rounded-[32px]" />
      </div>
    );
  }

  if (existingStatus === "active") {
    return (
      <div className="rounded-[32px] border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-emerald-600" size={32} />
        <h2 className="mt-4 text-xl font-semibold text-emerald-800">
          أنت مشترك بالفعل في هذه المادة
        </h2>
        <Link
          href={`/dashboard/classes/${subjectId}`}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          دخول للمادة
        </Link>
      </div>
    );
  }

  if (isSubmitted || hasPendingRequest) {
    return (
      <div className="rounded-[32px] border border-amber-200 bg-amber-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-amber-600" size={32} />
        <h2 className="mt-4 text-xl font-semibold text-amber-800">
          طلبك قيد المراجعة
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-amber-700">
          سيقوم فريقنا بمراجعة عملية الدفع وتفعيل اشتراكك خلال وقت قصير.
        </p>
        <Link
          href="/dashboard/subscriptions"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          العودة إلى الاشتراكات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
          إتمام الاشتراك
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {subject?.name ?? "الاشتراك"}
        </h1>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-3 text-slate-900">
          <div className="rounded-2xl bg-red-50 p-3 text-red-600">
            <Wallet size={22} />
          </div>
          <div>
            <p className="text-sm text-slate-500">الدفع عبر فودافون كاش</p>
            <h2 className="text-lg font-semibold">
              {subject?.price_egp
                ? `${subject.price_egp} جنيه مصري`
                : "حسب باقة المادة"}
            </h2>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <Smartphone size={18} className="text-slate-500" />
            <span
              dir="ltr"
              className="text-lg font-semibold tracking-wider text-slate-900"
            >
              {VODAFONE_CASH_NUMBER}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyNumber}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            <Copy size={14} />
            {copied ? "تم النسخ" : "نسخ"}
          </button>
        </div>

        <ol className="mt-6 list-inside list-decimal space-y-2 text-sm leading-7 text-slate-600">
          <li>حوّل قيمة الاشتراك إلى رقم فودافون كاش أعلاه.</li>
          <li>احتفظ برقم العملية أو لقطة شاشة من الإيصال.</li>
          <li>أدخل المبلغ ورقم العملية في النموذج أدناه ثم أرسل الطلب.</li>
        </ol>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-8 space-y-5 border-t border-slate-100 pt-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="amount-claimed"
              className="text-sm font-semibold text-slate-700"
            >
              المبلغ المدفوع (جنيه)
            </label>
            <input
              id="amount-claimed"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="مثال: 150"
              className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 ${
                errors.amountClaimed ? "border-rose-500" : "border-slate-200"
              }`}
              {...register("amountClaimed")}
            />
            {errors.amountClaimed ? (
              <p className="text-sm font-medium text-rose-600">
                {errors.amountClaimed.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="whatsapp-reference"
              className="text-sm font-semibold text-slate-700"
            >
              رقم العملية / رقم الهاتف المُرسِل
            </label>
            <input
              id="whatsapp-reference"
              type="text"
              placeholder="مثال: 010xxxxxxxx أو رقم العملية"
              className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 ${
                errors.whatsappReference
                  ? "border-rose-500"
                  : "border-slate-200"
              }`}
              {...register("whatsappReference")}
            />
            {errors.whatsappReference ? (
              <p className="text-sm font-medium text-rose-600">
                {errors.whatsappReference.message}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? "جارٍ الإرسال..." : "إرسال طلب الاشتراك"}
          </button>
        </form>
      </div>
    </div>
  );
}
