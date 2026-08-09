"use client";

import { useAuthStore, selectProfile } from "../store/useAuthStore";

function todayLabel() {
  return new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function AdminNavbar() {
  const profile = useAuthStore(selectProfile);

  return (
    <header className="flex items-center justify-between border-b border-[#DCE3D8] bg-[#F4F6F1] px-6 py-4 md:px-8">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-[#8A9587]">
          {todayLabel()}
        </p>
        <h1 className="mt-0.5 text-lg font-bold text-[#1B241C]">
          {profile?.full_name ?? "..."}
        </h1>
      </div>
      <div className="rounded-md border border-[#DCE3D8] bg-white px-3 py-1.5 text-xs font-semibold text-[#223A5E]">
        مدير المنصة
      </div>
    </header>
  );
}
