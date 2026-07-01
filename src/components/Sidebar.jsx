"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PackageOpen, CalendarDays, Sparkles } from "lucide-react";

const links = [
  { href: "/dashboard", label: "الرئيسية", icon: Home },
  { href: "/dashboard/packages", label: "تصفح الباقات", icon: PackageOpen },
  { href: "/dashboard/exams", label: "جدول الامتحانات", icon: CalendarDays },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-72 border-l border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur-md transition-transform duration-300 md:static md:translate-x-0 md:w-72 md:rounded-r-[32px] ${
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600 text-white">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                منصة الرياضيات
              </p>
              <p className="text-xs text-slate-500">بوابة الطالب</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 md:hidden"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
        <nav className="mt-10 space-y-2">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between rounded-3xl px-4 py-4 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{item.label}</span>
                <Icon size={18} />
              </Link>
            );
          })}
        </nav>
        <div className="mt-10 rounded-[32px] border border-slate-200 bg-slate-50 p-5 text-slate-700">
          <p className="text-sm font-semibold">تقدمك الدراسي</p>
          <p className="mt-2 text-sm leading-6">
            استعد لامتحانك القادم بخطوات منظمة وواضحة.
          </p>
        </div>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/20 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
