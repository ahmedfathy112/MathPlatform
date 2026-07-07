import AssistantSidebar from "../components/AssistantSidebar";
import AssistantNavbar from "../components/AssistantNavbar";
import RequireRole from "../components/auth/RequireRole";

export const metadata = {
  title: "لوحة المساعد",
  description: "لوحة تحكم المساعد في منصة الأستاذ سيد نور",
};

export default function AssistantLayout({ children }) {
  return (
    <RequireRole allow={["assistant", "teacher"]}>
      <div className="flex min-h-screen bg-[#070B1A]">
        <AssistantSidebar />
        <div className="flex flex-1 flex-col">
          <AssistantNavbar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
