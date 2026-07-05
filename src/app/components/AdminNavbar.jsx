"use client";

import { Bell, Settings, User } from "lucide-react";

export default function AdminNavbar() {
  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex flex-1 items-center justify-end gap-4">
        <button className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
          <Bell size={20} />
          <span className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center rounded-full bg-red-500" />
        </button>

        <button className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
          <Settings size={20} />
        </button>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
            أ
          </div>
          <div className="hidden flex-col gap-0.5 sm:flex">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              السيد نور
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              مدرس رياضيات
            </p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <User size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
