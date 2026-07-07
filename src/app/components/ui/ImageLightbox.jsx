"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Full-screen image preview modal. Closes on backdrop click or Escape.
 */
export default function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="absolute left-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      >
        <X size={20} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl"
      />
    </div>
  );
}
