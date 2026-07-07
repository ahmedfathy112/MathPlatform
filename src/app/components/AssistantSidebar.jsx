"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  UploadCloud,
  FilePlus2,
  LogOut,
  Zap,
} from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { useAuthStore } from "../store/useAuthStore";

const links = [
  {
    href: "/assistant",
    label: "نظرة عامة",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/assistant/students", label: "الطلاب", icon: Users },
  { href: "/assistant/payments", label: "المدفوعات", icon: Wallet },
  {
    href: "/assistant/content/upload-video",
    label: "رفع فيديو",
    icon: UploadCloud,
  },
  { href: "/assistant/exams/create", label: "إنشاء اختبار", icon: FilePlus2 },
];

export default function AssistantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  function isActive(link) {
    return link.exact ? pathname === link.href : pathname.startsWith(link.href);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="relative flex w-72 shrink-0 flex-col overflow-hidden border-l border-white/10 bg-slate-900/80 p-5 backdrop-blur-md">
      {/* Ambient glow accents — the "neon" in the neon-glow identity */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-violet-600/30 blur-[80px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-[80px]"
      />

      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_20px_rgba(139,92,246,0.45)]">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">لوحة المساعد</p>
          <p className="text-xs text-slate-400">الأستاذ سيد نور</p>
        </div>
      </div>

      <nav className="relative mt-10 flex-1 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                active
                  ? "bg-gradient-to-l from-indigo-600/30 via-violet-600/20 to-transparent text-white shadow-[0_0_18px_rgba(99,102,241,0.25)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-colors ${
                  active
                    ? "text-cyan-300"
                    : "text-slate-500 group-hover:text-cyan-300"
                }`}
              />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-300"
      >
        <LogOut size={18} />
        تسجيل الخروج
      </button>
    </aside>
  );
}
