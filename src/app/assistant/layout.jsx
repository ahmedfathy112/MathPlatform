import AssistantSidebar from "../components/AssistantSidebar";
import AssistantNavbar from "../components/AssistantNavbar";
import RequireRole from "../components/auth/RequireRole";
import { Menu } from "lucide-react";

export const metadata = {
  title: "لوحة المساعد",
  description: "لوحة تحكم المساعد في منصة الأستاذ سيد نور",
};

export default function AssistantLayout({ children }) {
  return (
    <RequireRole allow={["assistant", "teacher"]}>
      <div className="flex min-h-screen bg-[#070B1A] relative">
        {/* صندوق اختيار مخفي للتحكم في حالة فتح وإغلاق السايد بار عبر CSS */}
        <input type="checkbox" id="sidebar-toggle" className="peer hidden" />

        {/* طبقة التعتيم الخلفية عند فتح القائمة على الموبايل والتابلت */}
        <label
          htmlFor="sidebar-toggle"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto md:hidden transition-opacity duration-300"
        />

        {/* حاوية السايد بار المسؤولة عن الحركة (تتفاعل مباشرة مع الـ peer في نفس الملف) */}
        <div className="fixed inset-y-0 right-0 z-50 translate-x-full peer-checked:translate-x-0 md:translate-x-0 transition-transform duration-300 ease-in-out md:relative shrink-0 shadow-2xl md:shadow-none">
          <AssistantSidebar />
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          {/* شريط علوي للموبايل والتابلت يحتوي على زر الهمبرجر */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur-md md:hidden">
            <div className="flex items-center gap-3">
              <label
                htmlFor="sidebar-toggle"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="فتح القائمة"
              >
                <Menu size={22} />
              </label>
              <span className="text-sm font-semibold text-white">
                لوحة المساعد
              </span>
            </div>
          </div>

          <AssistantNavbar />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
