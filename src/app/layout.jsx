import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

// الـ Metadata الخاصة بمنصة الرياضيات
export const metadata = {
  title: "منصة الأستاذ في الرياضيات | رحلتك نحو التفوّق",
  description:
    "المنصة التعليمية الأقوى لشرح مادة الرياضيات لجميع المراحل الدراسية - حصص تفاعلية، اختبارات ذكية، ومتابعة دورية مستمرة.",
  keywords: [
    "رياضيات",
    "منصة تعليمية",
    "ثانوية عامة",
    "دروس خصوصية",
    "شرح رياضيات",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} min-h-full flex flex-col antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
