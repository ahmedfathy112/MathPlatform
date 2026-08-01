"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calculator, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { useAuthStore, selectProfile, selectRole, selectAuthStatus } from "../store/useAuthStore";

// Deliberately distinct from RequireRole's ROLE_HOME_ROUTES: teacher/assistant
// match (there's only one sensible home for each), but student points at
// /dashboard/subscriptions specifically — a more actionable landing spot
// for this button than the general dashboard overview.
const ROLE_DASHBOARD_ROUTES = {
  student: "/dashboard/subscriptions",
  teacher: "/admin",
  assistant: "/assistant",
};

const NAV_LINKS = [
  { href: "#features", label: "المزايا" },
  { href: "#courses", label: "المواد الدراسية" },
  { href: "#method", label: "كيف تبدأ معنا؟" },
  { href: "#stories", label: "قصص النجاح" },
  { href: "#faq", label: "الأسئلة الشائعة" },
];

export default function MainNavbar() {
  const router = useRouter();
  const profile = useAuthStore(selectProfile);
  const role = useAuthStore(selectRole);
  const status = useAuthStore(selectAuthStatus);
  const clearSession = useAuthStore((state) => state.clearSession);

  const isSettled = status === "authenticated" || status === "unauthenticated";
  const isAuthed = status === "authenticated" && profile;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="#hero" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
            <Calculator className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              منصة الرياضيات
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              طريقك الواضح نحو التفوق
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/*
          While `status` is "idle"/"loading" (before AuthListener resolves on
          mount), this renders a fixed-size skeleton rather than guessing at
          logged-in vs logged-out. The server-rendered HTML and the very
          first client render both start from the same "idle" state, so
          there's no structural mismatch to hydrate against — this block
          only swaps to real content after hydration, as an ordinary client
          state update, not a hydration error.
        */}
        {!isSettled ? (
          <div className="flex items-center gap-2">
            <div className="h-11 w-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-11 w-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : isAuthed ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-sm font-semibold text-slate-700 dark:text-slate-200 sm:inline">
              {profile.full_name}
            </span>
            <Link
              href={ROLE_DASHBOARD_ROUTES[role] ?? "/dashboard"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-500"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              <span>لوحة التحكم</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="تسجيل الخروج"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-rose-950/30"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-500"
            >
              إنشاء حساب
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
