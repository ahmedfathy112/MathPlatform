"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  CalendarCheck2,
  ChevronDown,
  ChevronUp,
  FileText,
  GraduationCap,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sigma,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const staggerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const features = [
  {
    title: "حصص تفاعلية مباشرة",
    description:
      "شرح واضح، أسئلة فورية، وتدرج مدروس يجعل الطالب يشارك ويتفاعل بثقة.",
    icon: BookOpen,
    accent: "from-blue-500 to-indigo-600",
  },
  {
    title: "اختبارات دورية ذكية",
    description:
      "قياس مستمر للمستوى مع ملاحظات دقيقة تساعد على سد الفجوات مبكرًا.",
    icon: CalendarCheck2,
    accent: "from-indigo-500 to-sky-600",
  },
  {
    title: "متابعة مع ولي الأمر",
    description:
      "تقارير واضحة عن الأداء والحضور والاستعداد بما يبقي الأسرة على اطلاع.",
    icon: Users,
    accent: "from-slate-800 to-slate-600",
  },
  {
    title: "ملازم PDF منظمة",
    description:
      "ملخصات مرتبة، تمارين مهمة، ومراجعات مركزة يمكن الرجوع إليها في أي وقت.",
    icon: FileText,
    accent: "from-cyan-500 to-blue-600",
  },
];

const courses = [
  {
    title: "الجبر والهندسة الفراغية",
    subtitle: "الصف الثالث الثانوي",
    description:
      "مسار متكامل يربط الفهم العميق بالقواعد الأساسية والمهارات عالية الدقة.",
    icon: Calculator,
    tone: "from-blue-600 via-indigo-600 to-slate-900",
  },
  {
    title: "الرياضيات البحتة",
    subtitle: "الصف الثاني الثانوي",
    description:
      "تأسيس قوي في الأفكار المجردة مع تدريب موجه على الاستنتاج الصحيح.",
    icon: Sigma,
    tone: "from-sky-600 via-blue-600 to-indigo-700",
  },
  {
    title: "التفاضل والتكامل",
    subtitle: "الصف الثالث الثانوي",
    description:
      "فهم تدريجي للمفاهيم المعقدة مع أمثلة عملية تختصر الوقت والمجهود.",
    icon: GraduationCap,
    tone: "from-indigo-600 via-slate-800 to-slate-950",
  },
];

const steps = [
  {
    number: "01",
    title: "أنشئ حسابك",
    description:
      "أدخل بياناتك مرة واحدة وابدأ رحلة منظمة داخل المنصة بكل سهولة.",
    icon: Sparkles,
  },
  {
    number: "02",
    title: "تصفح الباقات",
    description: "اختر المسار المناسب لمستواك الدراسي واحتياجاتك الحالية بدقة.",
    icon: BookOpen,
  },
  {
    number: "03",
    title: "ادفع فودافون كاش",
    description:
      "خطوات دفع واضحة وسريعة لتفعيل الوصول بدون تعقيد أو انتظار طويل.",
    icon: Wallet,
  },
  {
    number: "04",
    title: "ابدأ المذاكرة",
    description:
      "افتح دروسك، وراجع، واختبر نفسك مع متابعة فورية لتقدمك الحقيقي.",
    icon: PlayCircle,
  },
];

const testimonials = [
  {
    name: "أحمد محمود",
    score: "99%",
    role: "الأول على المدرسة",
    quote:
      "أكثر ما أعجبني أن الشرح كان منظمًا جدًا، والاختبارات جعلتني أعرف نقاط ضعفي بسرعة.",
  },
  {
    name: "سارة عبد الرحمن",
    score: "98%",
    role: "أعلى الدرجات في التفاضل",
    quote:
      "المتابعة المستمرة والملفات المنظمة اختصرت عليَّ الكثير من الوقت أثناء المراجعة.",
  },
  {
    name: "يوسف علي",
    score: "97%",
    role: "متفوق في الجبر",
    quote:
      "المنصة أعطتني ثقة حقيقية، وكل درس كان يقودني خطوة واضحة نحو مستوى أفضل.",
  },
];

const faqs = [
  {
    question: "ما وسائل الدفع المتاحة؟",
    answer:
      "يمكنك الدفع عبر فودافون كاش وفق تعليمات واضحة داخل الصفحة، ثم يبدأ التفعيل سريعًا بعد التأكيد.",
  },
  {
    question: "كيف أصل إلى الفيديوهات بعد الاشتراك؟",
    answer:
      "بمجرد تفعيل حسابك تظهر لك الدروس مباشرة داخل المسار الدراسي المناسب، دون خطوات معقدة.",
  },
  {
    question: "هل يمكن استخدام الحساب على أكثر من جهاز؟",
    answer:
      "يمكنك الدخول من الأجهزة المعتادة، مع الحفاظ على الاستخدام المنظم للحساب بما يضمن الأمان والاستقرار.",
  },
  {
    question: "هل توجد متابعة لأولياء الأمور؟",
    answer:
      "نعم، تتوفر تقارير مختصرة وواضحة تساعد ولي الأمر على متابعة مستوى الطالب وتقدمه بشكل مستمر.",
  },
];

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function SectionHeading({ label, title, description, centered = false }) {
  return (
    <div className={`space-y-4 ${centered ? "text-center" : "text-right"}`}>
      <SectionLabel>{label}</SectionLabel>
      <div className="space-y-3">
        <h2 className="text-3xl font-bold leading-[1.25] text-slate-950 dark:text-white sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ item }) {
  const Icon = item.icon;

  return (
    <motion.article
      variants={sectionVariants}
      whileHover={{ y: -6 }}
      className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)] dark:border-slate-700 dark:bg-slate-900"
    >
      <div
        className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${item.accent} p-3 text-white shadow-lg`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold text-slate-950 dark:text-white">
        {item.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {item.description}
      </p>
    </motion.article>
  );
}

function CourseCard({ course }) {
  const Icon = course.icon;

  return (
    <motion.article
      variants={sectionVariants}
      whileHover={{ y: -8, scale: 1.01 }}
      className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-300 dark:border-slate-700 dark:bg-slate-900"
    >
      <div
        className={`relative h-56 overflow-hidden bg-gradient-to-br ${course.tone}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_45%)]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute right-6 top-6 h-24 w-24 rounded-full border border-white/30" />
          <div className="absolute bottom-10 left-8 h-16 w-16 rounded-full border border-white/30" />
          <div className="absolute left-1/3 top-1/2 h-2 w-2 rounded-full bg-white/70" />
          <div className="absolute right-1/3 bottom-8 h-3 w-3 rounded-full bg-white/60" />
        </div>
        <div className="absolute inset-x-6 top-6 flex items-center justify-between text-white/90">
          <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
            مسار مميز
          </span>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] border border-white/20 bg-white/12 p-4 text-white backdrop-blur-md">
          <p className="text-sm font-medium opacity-90">{course.subtitle}</p>
          <p className="mt-1 text-lg font-bold leading-7">{course.title}</p>
        </div>
      </div>
      <div className="space-y-4 p-6 text-right">
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
          {course.description}
        </p>
        <Link
          href="/register"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/25"
        >
          <span>تصفح الباقة</span>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}

function StepCard({ step, index }) {
  const Icon = step.icon;

  return (
    <motion.article
      variants={sectionVariants}
      className="relative rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg dark:bg-slate-800">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="text-4xl font-black text-slate-200 dark:text-slate-700">
          0{index + 1}
        </span>
      </div>
      <h3 className="text-xl font-bold text-slate-950 dark:text-white">
        {step.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {step.description}
      </p>
    </motion.article>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <motion.article
      variants={sectionVariants}
      whileHover={{ y: -6 }}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
            {testimonial.name.slice(0, 1)}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              {testimonial.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {testimonial.role}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <Star className="h-4 w-4 fill-current" aria-hidden="true" />
          <span>{testimonial.score}</span>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-1 text-amber-500">
        <Star className="h-4 w-4 fill-current" aria-hidden="true" />
        <Star className="h-4 w-4 fill-current" aria-hidden="true" />
        <Star className="h-4 w-4 fill-current" aria-hidden="true" />
        <Star className="h-4 w-4 fill-current" aria-hidden="true" />
        <Star className="h-4 w-4 fill-current" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {testimonial.quote}
      </p>
    </motion.article>
  );
}

function FaqItem({ item, isOpen, onToggle, index }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right"
      >
        <span className="text-base font-bold text-slate-950 dark:text-white">
          {item.question}
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-300" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={`faq-panel-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-200 px-5 py-4 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {item.answer}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FaqAccordion({ items }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="mt-10 space-y-4">
      {items.map((item, index) => (
        <FaqItem
          key={item.question}
          item={item}
          index={index}
          isOpen={openFaq === index}
          onToggle={() =>
            setOpenFaq((current) => (current === index ? -1 : index))
          }
        />
      ))}
    </div>
  );
}

function LandingPage() {
  return (
    <main
      dir="rtl"
      className="relative isolate overflow-hidden bg-[var(--background)] text-[var(--foreground)]"
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="#hero" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
              <Calculator className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-950 dark:text-white">
                منصة الرياضيات
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                طريقك الواضح نحو التفوق
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            <Link
              href="#features"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              المزايا
            </Link>
            <Link
              href="#courses"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              المواد الدراسية
            </Link>
            <Link
              href="#method"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              كيف تبدأ معنا؟
            </Link>
            <Link
              href="#stories"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              قصص النجاح
            </Link>
            <Link
              href="#faq"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              الأسئلة الشائعة
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-500"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),linear-gradient(to_bottom,rgba(239,246,255,0.9),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_34%),linear-gradient(to_bottom,rgba(2,6,23,0.95),rgba(2,6,23,0))]" />
      <div className="pointer-events-none absolute left-0 top-24 -z-10 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute right-0 top-64 -z-10 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10" />

      <section
        id="hero"
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12 scroll-mt-28"
      >
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.10)] dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -left-10 top-10 h-44 w-44 rounded-full bg-blue-300/25 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 18, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute bottom-0 right-0 h-60 w-60 rounded-full bg-indigo-300/25 blur-3xl"
          />

          <div className="relative flex flex-col-reverse gap-10 px-6 py-10 lg:flex-row-reverse lg:items-center lg:gap-14 lg:px-10 lg:py-14">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative flex-1 text-right"
            >
              <SectionLabel>منصة تعليمية مصممة للتحويل والثقة</SectionLabel>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.2] tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                أتقن الرياضيات بثقة، وابدأ من هنا نحو أعلى النتائج
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600 dark:text-slate-300 sm:text-xl">
                منهجية شرح متدرجة، متابعة ذكية، واختبارات دورية تجعل كل فكرة
                واضحة وكل خطوة محسوبة، لتصل إلى أعلى مستوى بأقل تعقيد.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/25"
                >
                  <span>ابدأ رحلتك الآن</span>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-sky-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span>تسجيل الدخول</span>
                </Link>
              </div>

              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  "حصص مباشرة",
                  "اختبارات منتظمة",
                  "تقرير لولي الأمر",
                  "ملازم منظمة",
                  "تقييم مستمر",
                  "استعداد للامتحان",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="relative flex-1"
            >
              <div className="relative mx-auto max-w-xl">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-4 -top-8 z-10 rounded-[1.5rem] border border-slate-200 bg-white/95 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-950 dark:text-white">
                        ثقة وأمان
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        حسابات مرتبة وتجربة واضحة
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{
                    duration: 6.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -left-2 -bottom-10 z-10 rounded-[1.5rem] border border-slate-200 bg-white/95 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-slate-800">
                      <Sparkles className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-950 dark:text-white">
                        متابعة ذكية
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        كل خطوة محسوبة بدقة
                      </p>
                    </div>
                  </div>
                </motion.div>

                <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-950 sm:p-7">
                  <div className="grid gap-5 sm:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-5">
                      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            رحلة الطالب
                          </p>
                          <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                            ٩٨٪
                          </p>
                        </div>
                        <div className="mt-4 space-y-3">
                          {[74, 91, 68, 96, 86].map((value, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>درس {index + 1}</span>
                                <span>{value}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value}%` }}
                                  transition={{
                                    duration: 1.1,
                                    delay: 0.2 + index * 0.1,
                                  }}
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            عدد الحصص
                          </p>
                          <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                            ١٢
                          </p>
                        </div>
                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            مستوى الثقة
                          </p>
                          <p className="mt-2 text-3xl font-black text-sky-600 dark:text-sky-400">
                            عالي
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-950 p-5 text-white shadow-[0_24px_50px_rgba(37,99,235,0.35)]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_34%)]" />
                      <div className="relative flex h-full min-h-[320px] flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                            لوح المتابعة
                          </span>
                          <Calculator className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <div className="space-y-4">
                          <div className="inline-flex rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur">
                            معادلات واضحة، نتائج أقوى، وثقة أكبر
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {["فهم", "تدريب", "مراجعة", "إتقان"].map(
                              (label, index) => (
                                <div
                                  key={label}
                                  className="rounded-2xl border border-white/15 bg-white/10 p-3 text-right backdrop-blur"
                                >
                                  <p className="text-[11px] text-white/70">
                                    خطوة {index + 1}
                                  </p>
                                  <p className="mt-1 text-sm font-bold">
                                    {label}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-white/70">
                              مؤشر الاستعداد
                            </p>
                            <p className="mt-1 text-3xl font-black">٩٤٪</p>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                            <Sigma className="h-4 w-4" aria-hidden="true" />
                            <span>منهجية متقدمة</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <motion.section
        id="features"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-28"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
      >
        <SectionHeading
          label="مزايا المنصة"
          title="كل ما يحتاجه الطالب ليذاكر بتركيز أعلى وثقة أكبر"
          description="المنصة تجمع بين التفاعل، التنظيم، والمتابعة المستمرة لتجعل رحلة التعلم أكثر سلاسة وأقرب إلى نتائج ملموسة."
        />
        <motion.div
          variants={staggerVariants}
          className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {features.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="courses"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-28"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
      >
        <SectionHeading
          label="المواد الدراسية"
          title="اختر المسار المناسب وابدأ من المستوى الذي يخدم هدفك"
          description="كل مسار مصمم بعناية ليخاطب احتياجًا دراسيًا واضحًا، مع بنية تساعد الطالب على الانتقال من الأساس إلى الإتقان."
        />
        <motion.div
          variants={staggerVariants}
          className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {courses.map((course) => (
            <CourseCard key={course.title} course={course} />
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="method"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-28"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <SectionHeading
          label="كيف تبدأ معنا؟"
          title="أربع خطوات واضحة تكفي لتبدأ بشكل منظم وسريع"
          description="لا حاجة للتشتت. اختر، فعّل، وابدأ مباشرة من خلال مسار قصير ومفهوم."
        />
        <div className="relative mt-10">
          <div className="absolute inset-x-8 top-10 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent xl:block dark:via-slate-700" />
          <motion.div
            variants={staggerVariants}
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
          >
            {steps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="stories"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-28"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
      >
        <SectionHeading
          label="قصص نجاح طلابنا"
          title="ثقة أعلى ونتائج أقوى من خلال تجربة تعليمية منظمة"
          description="هذه نماذج مبدئية تعكس الأثر الذي نطمح إليه لدى الطلاب المتفوقين وأولياء الأمور."
        />
        <motion.div
          variants={staggerVariants}
          className="mt-10 grid gap-6 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="faq"
        className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-28"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
      >
        <SectionHeading
          label="الأسئلة الشائعة"
          title="إجابات مختصرة على أكثر الأسئلة التي تتكرر قبل الاشتراك"
          description="وضوح المعلومات من البداية يساعد الطالب وولي الأمر على اتخاذ القرار بثقة."
        />
        <FaqAccordion items={faqs} />
      </motion.section>

      {/* FOOTER */}
      <footer
        id="footer"
        className="border-t border-slate-200 bg-slate-950 px-4 py-16 text-slate-100 dark:border-slate-800 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-5 text-right">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <Calculator className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">منصة الرياضيات</p>
                <p className="text-sm text-slate-400">
                  تعلم منظم، وثقة أعلى، ونتائج أقوى
                </p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              منصة تعليمية تركّز على الوضوح، المتابعة، والاستعداد الحقيقي للنجاح
              في الرياضيات عبر محتوى مدروس وتجربة استخدام بسيطة ومريحة.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "تسجيل الدخول", href: "/login" },
                { label: "إنشاء حساب", href: "/register" },
                { label: "المزايا", href: "#features" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4 text-right">
            <h3 className="text-lg font-bold text-white">روابط سريعة</h3>
            <div className="grid gap-3 text-sm">
              {[
                { label: "المواد الدراسية", href: "#courses" },
                { label: "كيف تبدأ معنا؟", href: "#method" },
                { label: "قصص النجاح", href: "#stories" },
                { label: "الأسئلة الشائعة", href: "#faq" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4 text-right">
            <h3 className="text-lg font-bold text-white">ابدأ الآن</h3>
            <p className="text-sm leading-7 text-slate-400">
              إذا كنت جاهزًا لاتخاذ الخطوة التالية، فابدأ بحساب جديد أو ادخل
              مباشرة إلى حسابك الحالي.
            </p>
            <div className="grid gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-bold text-white transition hover:bg-sky-500"
              >
                إنشاء حساب جديد
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 text-sm font-bold text-slate-200 transition hover:bg-slate-800"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 flex w-full max-w-7xl flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>جميع الحقوق محفوظة لمنصة الرياضيات</p>
          <div className="flex items-center gap-4">
            <span>تعلم واضح</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
            <span>متابعة دقيقة</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
            <span>نتائج أقوى</span>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/201000000000"
        target="_blank"
        rel="noreferrer"
        aria-label="التواصل عبر واتساب"
        className="fixed bottom-4 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[0_20px_40px_rgba(16,185,129,0.35)] transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 sm:bottom-6 sm:right-6"
      >
        <MessageCircle className="h-7 w-7" aria-hidden="true" />
      </a>
    </main>
  );
}

export default LandingPage;
