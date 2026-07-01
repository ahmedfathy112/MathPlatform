"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff,_#f4f7fb_45%,_#eef3f9)] px-3 py-3 sm:px-5 lg:px-6"
    >
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col gap-4">
          <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="min-w-0 rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
