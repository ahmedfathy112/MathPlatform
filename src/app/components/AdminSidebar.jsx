"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  BookOpen,
  Layers,
  PlayCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { useAuthStore } from "../store/useAuthStore";

const links = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutGrid, exact: true },
  { href: "/admin/students", label: "الطلاب", icon: Users },
  { href: "/admin/packages", label: "الباقات", icon: Layers },
  { href: "/admin/courses", label: "الدورات", icon: BookOpen },
  { href: "/admin/exams", label: "الاختبارات", icon: PlayCircle },
];

/** The signature mark — an ink-stamp circle, like a registrar's seal, rather than a generic icon-in-rounded-square. */
function StampMark() {
  return (
    <svg viewBox="0 0 56 56" className="h-11 w-11 shrink-0" aria-hidden="true">
      <circle
        cx="28"
        cy="28"
        r="25"
        fill="none"
        stroke="#1F6E43"
        strokeWidth="2"
        transform="rotate(-6 28 28)"
      />
      <circle
        cx="28"
        cy="28"
        r="20"
        fill="none"
        stroke="#1F6E43"
        strokeWidth="1"
        strokeDasharray="2 3"
        transform="rotate(-6 28 28)"
      />
      <text
        x="28"
        y="33"
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill="#1F6E43"
        transform="rotate(-6 28 28)"
        style={{ fontFamily: "var(--font-cairo, sans-serif)" }}
      >
        س.ن
      </text>
    </svg>
  );
}

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="فتح القائمة"
        className="fixed right-4 top-4 z-30 rounded-md border border-[#DCE3D8] bg-[#F4F6F1] p-2 text-[#1B241C] md:hidden"
      >
        <Menu size={20} />
      </button>

      {isOpen ? (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-72 shrink-0 flex-col border-l border-[#DCE3D8] bg-[#F4F6F1] transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#DCE3D8] px-6 py-5">
          <div className="flex items-center gap-3">
            <StampMark />
            <div>
              <p className="text-sm font-bold leading-tight text-[#1B241C]">
                سجل الإدارة
              </p>
              <p className="text-xs leading-tight text-[#4A594C]">
                الأستاذ سيد نور
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق القائمة"
            className="rounded-md p-1 text-[#4A594C] md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav rendered as an indexed register, not pill buttons — each row
            numbered like a ledger's line items, active row gets a solid
            left rule instead of a filled background chip. */}
        <nav className="flex-1 overflow-y-auto py-2">
          {links.map((link, index) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 border-r-2 px-6 py-3 text-sm transition-colors ${
                  active
                    ? "border-[#1F6E43] bg-[#EAF0E6] font-bold text-[#1B241C]"
                    : "border-transparent text-[#4A594C] hover:bg-[#EEF1EA] hover:text-[#1B241C]"
                }`}
              >
                <span
                  className="w-5 shrink-0 text-right font-mono text-[11px] tabular-nums text-[#8A9587]"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon size={17} className={active ? "text-[#1F6E43]" : ""} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#DCE3D8] px-6 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-[#4A594C] transition-colors hover:bg-[#F4E4DF] hover:text-[#9A3324]"
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
