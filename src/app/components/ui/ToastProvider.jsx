"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const VARIANT_STYLES = {
  error: {
    icon: AlertCircle,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

const DEFAULT_DURATION_MS = 4500;

/**
 * Lightweight, dependency-free toast system. Wrap the app once in
 * src/app/layout.jsx, then call useToast() from any client component:
 *
 *   const { showToast } = useToast();
 *   showToast({ type: "error", message: "تعذر تحميل البيانات." });
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", message, durationMs = DEFAULT_DURATION_MS }) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, type, message }]);
      if (durationMs > 0) {
        setTimeout(() => dismissToast(id), durationMs);
      }
      return id;
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      >
        {toasts.map((toast) => {
          const variant = VARIANT_STYLES[toast.type] ?? VARIANT_STYLES.info;
          const Icon = variant.icon;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 text-sm shadow-lg ${variant.className}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="flex-1 leading-6">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="إغلاق"
                className="shrink-0 rounded-full p-1 opacity-70 transition hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast() must be used within <ToastProvider>");
  }
  return context;
}
