import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import RequireRole from "../components/auth/RequireRole";

export const metadata = {
  title: "لوحة الإدارة",
  description: "إدارة المنصة التعليمية",
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)] dark:bg-slate-950">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminNavbar />

        <main className="flex-1 overflow-y-auto bg-[var(--background)] dark:bg-slate-950">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <RequireRole allow={["teacher"]}>{children}</RequireRole>
          </div>
        </main>
      </div>

      <div className="md:hidden">
        <AdminSidebar />
      </div>
    </div>
  );
}
