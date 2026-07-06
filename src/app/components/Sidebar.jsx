"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PackageOpen, CalendarDays } from "lucide-react";

const links = [
  { href: "/dashboard", label: "الرئيسية", icon: Home },
  {
    href: "/dashboard/subscriptions",
    label: "تصفح الباقات",
    icon: PackageOpen,
  },
  {
    href: "/dashboard/classes/exams",
    label: "جدول الامتحانات",
    icon: CalendarDays,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const isLinkActive = (href) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-[86vw] max-w-[320px] flex-col overflow-hidden bg-[#101B3D] p-5 shadow-2xl transition-transform duration-300 motion-reduce:transition-none sm:p-6 md:static md:w-20 md:max-w-none md:translate-x-0 md:rounded-[28px] md:p-4 lg:w-[272px] lg:p-6 ${
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {/* Faint graph-paper texture — a nod to math notebooks, kept subtle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#93A0D6 1px, transparent 1px), linear-gradient(90deg, #93A0D6 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative flex items-center justify-between gap-3 md:justify-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F5B942] text-lg font-bold text-[#101B3D]">
              π
            </div>
            <div className="md:hidden lg:block">
              <p className="text-sm font-semibold text-white">منصة الرياضيات</p>
              <p className="text-xs text-[#93A0D6]">بوابة الطالب</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="rounded-full bg-white/5 p-2 text-[#93A0D6] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] md:hidden"
          >
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>

        <nav className="relative mt-8 flex-1 space-y-1.5 md:mt-10">
          {links.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={item.label}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-2xl py-3.5 pr-4 pl-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] md:justify-center md:px-0 lg:justify-start lg:px-4 ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-[#93A0D6] hover:bg-white/5 hover:text-white"
                }`}
              >
                {/* Bracket-style active indicator, a small nod to math notation */}
                <span
                  className={`absolute right-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#F5B942] transition-all duration-200 motion-reduce:transition-none ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  }`}
                  aria-hidden="true"
                />
                <Icon size={18} className="shrink-0" />
                <span className="md:hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-8 hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-white lg:block">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5B942]" />
            <p className="text-sm font-semibold">تقدمك الدراسي</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#93A0D6]">
            استعد لامتحانك القادم بخطوات منظمة وواضحة.
          </p>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
