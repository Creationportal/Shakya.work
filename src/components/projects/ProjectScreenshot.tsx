"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function ProjectScreenshot({
  src,
  alt,
  label,
  closeLabel = "Close",
}: {
  src: string;
  alt: string;
  label: string;
  closeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  // Lock body scroll and move focus into the dialog; restore both on close.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      lastActiveRef.current?.focus?.();
    };
  }, [open]);

  // ESC to close + simple focus trap while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        closeRef.current?.parentElement?.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-md border border-line bg-paper"
        aria-label={label}
      >
        <Image
          src={src}
          alt={alt}
          width={960}
          height={540}
          className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority
        />
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-line/80 bg-paper/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted shadow-sm backdrop-blur">
          {label}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-paper/95 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-ink"
          >
            {closeLabel}
          </button>
          <Image
            src={src}
            alt={alt}
            width={1440}
            height={810}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-auto max-w-full rounded-lg border border-line shadow-xl"
          />
        </div>
      )}
    </>
  );
}
