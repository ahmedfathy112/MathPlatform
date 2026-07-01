"use client";

import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";

export default function Navbar({ onOpenSidebar }) {
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
          <h1 className="text-lg font-semibold text-slate-900">أهلاً، يوسف</h1>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <button className="rounded-2xl bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
            ي
          </div>
          <div className="hidden min-w-0 flex-col gap-0.5 truncate sm:flex">
            <span className="truncate text-sm font-semibold text-slate-900">
              يوسف أحمد
            </span>
            <span className="truncate text-xs text-slate-500">
              طالب أولى ثانوي
            </span>
          </div>
          <ChevronDown size={16} className="text-slate-500" />
        </div>
        <button className="hidden items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 md:inline-flex">
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}
