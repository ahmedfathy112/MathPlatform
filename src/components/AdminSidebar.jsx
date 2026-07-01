"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  BookOpen,
  Package,
  Play,
  Menu,
  X,
  LogOut,
} from "lucide-react";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      label: "نظرة عامة",
      href: "/admin",
      icon: BarChart3,
    },
    {
      label: "إدارة الباقات",
      href: "/admin/packages",
      icon: Package,
    },
    {
      label: "الدورات",
      href: "/admin/courses",
      icon: BookOpen,
    },
    {
      label: "محتوى الفيديو",
      href: "/admin/content/upload-video",
      icon: Play,
    },
    {
      label: "إدارة الامتحانات",
      href: "/admin/exams",
      icon: BookOpen,
    },
    {
      label: "الطلاب والأكواد",
      href: "/admin/students",
      icon: Users,
    },
  ];

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-40 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white md:hidden"
      >
        <Menu size={20} />
      </button>

      <aside
        className={`fixed inset-y-0 right-0 z-30 w-64 transform bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-transform duration-300 ease-in-out dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-700 px-6">
          <h1 className="text-lg font-bold bg-gradient-to-l from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            الأستاذ
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4 py-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-red-400">
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
