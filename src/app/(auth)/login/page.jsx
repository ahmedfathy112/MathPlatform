"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  Calculator,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Phone,
  Sigma,
  Sparkles,
} from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import {
  fetchProfileWithRetry,
  phoneToSyntheticEmail,
} from "../../utils/supabase/auth-helpers";
import { useAuthStore } from "../../store/useAuthStore";

/** Where each role lands after a successful login. */
const ROLE_HOME_ROUTES = {
  teacher: "/admin",
  assistant: "/assistant",
  student: "/dashboard",
};

const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "يجب أن يتكون رقم الهاتف من 11 رقمًا بالضبط"),
  password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
});

function ErrorBanner({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

function FieldMessage({ error, id }) {
  if (!error) {
    return null;
  }

  return (
    <p id={id} className="text-sm font-medium text-rose-600">
      {error.message}
    </p>
  );
}

function TextField({
  id,
  label,
  icon: Icon,
  error,
  registerProps,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition-all duration-200 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10 ${
          error ? "border-rose-500" : "border-slate-200"
        }`}
      >
        <Icon
          className={`h-5 w-5 shrink-0 ${error ? "text-rose-500" : "text-slate-400"}`}
          aria-hidden="true"
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full border-0 bg-transparent p-0 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
          {...registerProps}
        />
      </div>
      <FieldMessage id={`${id}-error`} error={error} />
    </div>
  );
}

function PasswordField({
  id,
  label,
  icon: Icon,
  error,
  registerProps,
  placeholder,
}) {
  const [visible, setVisible] = useState(false);
  const ToggleIcon = visible ? EyeOff : Eye;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition-all duration-200 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10 ${
          error ? "border-rose-500" : "border-slate-200"
        }`}
      >
        <Icon
          className={`h-5 w-5 shrink-0 ${error ? "text-rose-500" : "text-slate-400"}`}
          aria-hidden="true"
        />
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full border-0 bg-transparent p-0 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
          {...registerProps}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          aria-pressed={visible}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/20"
        >
          <ToggleIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <FieldMessage id={`${id}-error`} error={error} />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState(null);
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = async ({ phone, password }) => {
    setFormError(null);
    const supabase = createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: phoneToSyntheticEmail(phone),
        password,
      });

    if (authError) {
      setFormError("رقم الهاتف أو كلمة المرور غير صحيحة.");
      return;
    }

    const profile = await fetchProfileWithRetry(supabase, authData.user.id, {
      attempts: 1, // existing accounts should already have a profile row
    });

    if (!profile) {
      setFormError("تعذر تحميل بيانات الحساب. يرجى المحاولة مرة أخرى.");
      await supabase.auth.signOut();
      return;
    }

    if (profile.is_banned) {
      setFormError(
        "تم إيقاف هذا الحساب. يرجى التواصل مع الدعم الفني لمزيد من التفاصيل.",
      );
      await supabase.auth.signOut();
      return;
    }

    setSession(authData.user, profile);

    const redirectTo = searchParams.get("redirectTo");
    const destination =
      redirectTo || ROLE_HOME_ROUTES[profile.role] || "/dashboard";
    router.push(destination);
    router.refresh();
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"
    >
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-2">
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <div className="mb-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>تسجيل دخول الطالب</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">
                  ادخل إلى حسابك بأمان
                </h2>
                <p className="max-w-lg text-sm leading-7 text-slate-600">
                  استخدم رقم الهاتف وكلمة المرور للوصول إلى كل ما تحتاجه داخل
                  المنصة.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <ErrorBanner message={formError} />

              <TextField
                id="student-phone"
                label="رقم الهاتف"
                icon={Phone}
                error={errors.phone}
                placeholder="أدخل رقم الهاتف"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={11}
                registerProps={register("phone", {
                  setValueAs: (value) => String(value ?? "").replace(/\D/g, ""),
                })}
              />

              <PasswordField
                id="student-password"
                label="كلمة المرور"
                icon={LockKeyhole}
                error={errors.password}
                placeholder="أدخل كلمة المرور"
                registerProps={register("password")}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:bg-sky-400"
              >
                {isSubmitting ? (
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                <span>
                  {isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
                </span>
              </button>

              <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/forgot-password"
                  className="font-semibold text-sky-700 transition hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                >
                  نسيت كلمة المرور؟
                </Link>
                <div className="text-slate-600">
                  <span>ليس لديك حساب؟ </span>
                  <Link
                    href="/register"
                    className="font-semibold text-sky-700 transition hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                  >
                    إنشاء حساب
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="relative hidden items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:flex lg:px-12">
          <div className="relative z-10 w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>حساب الطالب</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold leading-[1.25] text-slate-900 sm:text-4xl">
                  مرحبًا بعودتك إلى مسارك الدراسي
                </h1>
                <p className="max-w-lg text-base leading-8 text-slate-600">
                  سجّل دخولك للوصول إلى الدروس المنظمة، والاختبارات الذكية،
                  ومتابعة تقدمك خطوة بخطوة.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <p className="text-lg font-semibold leading-9">
                  &quot;الرياضيات تكافئ الثبات، وكل يوم مراجعة يرفع من وضوحك
                  وثقتك.&quot;
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-4 inline-flex rounded-2xl bg-blue-600 p-3 text-white">
                    <Calculator className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="text-base font-semibold text-slate-900">
                    شرح متدرج
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    محتوى واضح يبدأ من الأساسيات ويصل إلى المهارات المتقدمة.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-4 inline-flex rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-700">
                    <Sigma className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="text-base font-semibold text-slate-900">
                    تقدم محسوب
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    كل اختبار يضيف مؤشرًا أدق لرحلتك التعليمية.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              عند تسجيل الدخول، تأكد من إدخال رقم الهاتف الصحيح وكلمة المرور
              الخاصة بحسابك فقط.
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.18) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="pointer-events-none absolute left-8 top-8 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900">
            <p className="text-3xl font-bold text-sky-700 dark:text-sky-300">
              Σ
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              كل معادلة لها طريق واضح
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
