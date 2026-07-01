import DashboardShell from "./DashboardShell";

export const metadata = {
  title: "لوحة الطالب",
  description: "لوحة الطالب في منصة الرياضيات",
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
