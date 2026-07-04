"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const gradeOptions = [
  { value: "first", label: "الصف الأول الثانوي" },
  { value: "second", label: "الصف الثاني الثانوي" },
  { value: "third", label: "الصف الثالث الثانوي" },
];

const registrationSchema = z
  .object({
    fullName: z.string().trim().min(8, "يرجى إدخال الاسم الرباعي الكامل"),
    phone: z
      .string()
      .trim()
      .regex(/^\d{11}$/, "يجب أن يتكون رقم الهاتف من 11 رقمًا بالضبط"),
    grade: z
      .string()
      .min(1, "يرجى اختيار الصف الدراسي")
      .refine((value) => ["first", "second", "third"].includes(value), {
        message: "يرجى اختيار الصف الدراسي",
      }),
    password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
    confirmPassword: z
      .string()
      .min(6, "تأكيد كلمة المرور يجب ألا يقل عن 6 أحرف"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "كلمتا المرور غير متطابقتين",
  });

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

function SelectField({ id, label, error, registerProps, placeholder, options }) {
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
        <GraduationCap
          className={`h-5 w-5 shrink-0 ${error ? "text-rose-500" : "text-slate-400"}`}
          aria-hidden="true"
        />
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full border-0 bg-transparent p-0 text-[15px] text-slate-900 outline-none"
          {...registerProps}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
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
          autoComplete="new-password"
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

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      phone: "",
      grade: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async () => {
    await sleep(900);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="h-2 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />
          <div className="space-y-6 px-6 py-8 sm:px-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>إنشاء حساب طالب</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                  ابدأ رحلتك التعليمية من حساب منظم وآمن
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600">
                  أدخل بياناتك بدقة لتتمكن من متابعة الدروس، والاختبارات، وإجمالي
                  تقدمك بسهولة.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-sky-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              تأكد من صحة البيانات قبل الإرسال حتى يكون حسابك جاهزًا للاستخدام
              بدون أي تعارضات.
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  id="student-full-name"
                  label="الاسم الرباعي"
                  icon={UserRound}
                  error={errors.fullName}
                  placeholder="أدخل الاسم الرباعي"
                  autoComplete="name"
                  registerProps={register("fullName")}
                />

                <TextField
                  id="student-register-phone"
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
              </div>

              <SelectField
                id="student-grade"
                label="الصف الدراسي"
                error={errors.grade}
                placeholder="اختر الصف الدراسي"
                options={gradeOptions}
                registerProps={register("grade")}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <PasswordField
                  id="student-register-password"
                  label="كلمة المرور"
                  icon={LockKeyhole}
                  error={errors.password}
                  placeholder="أدخل كلمة المرور"
                  registerProps={register("password")}
                />

                <PasswordField
                  id="student-confirm-password"
                  label="تأكيد كلمة المرور"
                  icon={LockKeyhole}
                  error={errors.confirmPassword}
                  placeholder="أعد إدخال كلمة المرور"
                  registerProps={register("confirmPassword")}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:bg-sky-400"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : null}
                <span>{isSubmitting ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}</span>
              </button>

              <div className="text-center text-sm text-slate-600">
                <span>لديك حساب بالفعل؟ </span>
                <Link
                  href="/login"
                  className="font-semibold text-sky-700 transition hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
