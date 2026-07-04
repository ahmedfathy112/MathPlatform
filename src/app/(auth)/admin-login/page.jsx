"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const adminLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "يرجى إدخال اسم المستخدم أو البريد الإلكتروني"),
  password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
});

function FieldMessage({ error, id }) {
  if (!error) {
    return null;
  }

  return (
    <p id={id} className="text-sm font-medium text-rose-300">
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
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-200 ">
        {label}
      </label>
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-sm transition-all duration-200 focus-within:ring-4 focus-within:ring-indigo-500/10 ${
          error
            ? "border-rose-500 bg-slate-800/80"
            : "border-slate-700 bg-slate-800/70"
        }`}
      >
        <Icon
          className={`h-5 w-5 shrink-0 ${error ? "text-rose-300" : "text-slate-400"}`}
          aria-hidden="true"
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          spellCheck="false"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full border-0 bg-transparent p-4 rounded-2xl text-[15px] text-slate-100 outline-none placeholder:text-slate-400"
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
  visible,
  onToggle,
}) {
  const ToggleIcon = visible ? EyeOff : Eye;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-200">
        {label}
      </label>
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-sm transition-all duration-200 focus-within:ring-4 focus-within:ring-indigo-500/10 ${
          error
            ? "border-rose-500 bg-slate-800/80"
            : "border-slate-700 bg-slate-800/70"
        }`}
      >
        <Icon
          className={`h-5 w-5 shrink-0 ${error ? "text-rose-300" : "text-slate-400"}`}
          aria-hidden="true"
        />
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full border-0 bg-transparent p-4 rounded-2xl text-[15px] text-slate-100 outline-none placeholder:text-slate-400"
          {...registerProps}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          aria-pressed={visible}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-700/80 hover:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        >
          <ToggleIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <FieldMessage id={`${id}-error`} error={error} />
    </div>
  );
}

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    mode: "onTouched",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async () => {
    await sleep(900);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.95),#020617_60%)] text-slate-100"
    >
      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-7 shadow-[0_30px_90px_rgba(2,6,23,0.6)] backdrop-blur-xl sm:p-8">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-[11px] font-semibold tracking-[0.28em] text-slate-400">
              وصول محمي
            </div>
            <h1 className="text-2xl font-bold leading-[1.45] text-slate-100 sm:text-3xl">
              بوابة إدارة المنصة
            </h1>
            <p className="text-sm leading-7 text-slate-400">
              تسجيل دخول مخصص للمشرفين والمساعدين فقط.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-8 space-y-5"
          >
            <TextField
              id="admin-identifier"
              label="اسم المستخدم أو البريد"
              icon={UserRound}
              error={errors.identifier}
              placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
              autoComplete="username"
              registerProps={register("identifier")}
            />

            <PasswordField
              id="admin-password"
              label="كلمة المرور"
              icon={LockKeyhole}
              error={errors.password}
              placeholder="أدخل كلمة المرور"
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
              registerProps={register("password")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : null}
              <span>{isSubmitting ? "جارٍ التحقق..." : "تسجيل الدخول"}</span>
            </button>
          </form>

          <p className="mt-6 text-sm leading-7 text-slate-400">
            نسيت كلمة المرور؟ تواصل مع الدعم الفني
          </p>
        </div>
      </div>
    </main>
  );
}
