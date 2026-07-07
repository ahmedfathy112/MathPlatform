"use client";

import { useAuthStore, selectProfile } from "../store/useAuthStore";

export default function AssistantNavbar() {
  const profile = useAuthStore(selectProfile);
  const initial = profile?.full_name?.trim().charAt(0) || "م";

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-6 py-4 backdrop-blur-md">
      <div>
        <p className="text-sm text-slate-400">مرحبًا بعودتك</p>
        <h1 className="text-lg font-semibold text-white">
          {profile?.full_name ?? "..."}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
          مساعد
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-bold text-white shadow-[0_0_14px_rgba(34,211,238,0.35)]">
          {initial}
        </div>
      </div>
    </header>
  );
}
