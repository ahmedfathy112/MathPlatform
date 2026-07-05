"use client";

import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { useAuthStore, selectProfile } from "../store/useAuthStore";

const GRADE_LABELS = {
  prep_1: "أولى إعدادي",
  prep_2: "ثانية إعدادي",
  prep_3: "ثالثة إعدادي",
  secondary_1: "أولى ثانوي",
  secondary_2: "ثانية ثانوي",
  secondary_3: "ثالثة ثانوي",
};

export default function Navbar({ onOpenSidebar }) {
  const router = useRouter();
  const profile = useAuthStore(selectProfile);
  const clearSession = useAuthStore((state) => state.clearSession);

  const displayName = profile?.full_name ?? "...";
  const initial = displayName.trim().charAt(0) || "؟";
  const gradeLabel = profile?.grade_level
    ? (GRADE_LABELS[profile.grade_level] ?? profile.grade_level)
    : null;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <p className="text-sm text-slate-500">مرحباً بك مجدداً</p>
          <h1 className="text-lg font-semibold text-slate-900">
            أهلاً، {displayName}
          </h1>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <button className="rounded-2xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
            {initial}
          </div>
          <div className="hidden min-w-0 flex-col gap-0.5 truncate sm:flex">
            <span className="truncate text-sm font-semibold text-slate-900">
              {displayName}
            </span>
            {gradeLabel ? (
              <span className="truncate text-xs text-slate-500">
                طالب {gradeLabel}
              </span>
            ) : null}
          </div>
          <ChevronDown size={16} className="text-slate-500" />
        </div>
        <button
          onClick={handleLogout}
          className="hidden items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 md:inline-flex"
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}
