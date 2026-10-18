"use client";

/**
 * Accessible lightbox for photos & videos.
 * • Keyboard: ← / → to move, Esc to close, focus returns to the opener.
 * • Videos use native controls with WebVTT captions when available.
 * • No animation beyond a gentle fade (disabled by reduced-motion CSS).
 */
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaVM } from "@/lib/types";

export function Lightbox({
  items,
  startIndex,
  onClose,
  label,
}: {
  items: MediaVM[];
  startIndex: number;
  onClose: () => void;
  label: string;
}) {
  const [index, setIndex] = useState(startIndex);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + items.length) % items.length),
    [items.length],
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, prev, next]);

  // Very small focus trap: Tab cycles within the dialog.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], video[controls], [tabindex]:not([tabindex="-1"])',
    );
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

  const current = items[index];
  if (!current) return null;

  return (
    <div
      className="lightbox-backdrop animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      ref={dialogRef}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mb-3 flex w-full max-w-4xl items-center justify-between gap-3">
        <p className="text-sm text-cream-100">
          {index + 1} / {items.length}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="btn-ghost !px-4 !py-1.5">
          ✕ বন্ধ করুন
        </button>
      </div>

      <div className="relative flex max-h-[75vh] w-full max-w-4xl items-center justify-center">
        {current.kind === "video" ? (
          /* Sample posters fall back to an <img>-like placeholder via next/image;
             real videos come from /api/media and play inline with captions. */
          <video
            controls
            autoPlay
            className="max-h-[75vh] w-auto rounded-2xl bg-black"
            poster={current.src.endsWith(".svg") ? undefined : current.src}
            aria-label={current.alt}
          >
            <source src={current.src} />
            {current.captionsSrc ? (
              <track kind="captions" src={current.captionsSrc} srcLang="bn" label="বাংলা" default />
            ) : null}
            আপনার ব্রাউজার ভিডিও চালাতে পারে না।
          </video>
        ) : (
          <Image
            src={current.src}
            alt={current.alt}
            width={1600}
            height={1200}
            className="max-h-[75vh] w-auto rounded-2xl object-contain"
          />
        )}
      </div>

      <div className="mt-3 flex max-w-4xl items-center justify-between gap-3">
        <button type="button" onClick={prev} className="btn-ghost !px-4 !py-1.5">
          ← আগের
        </button>
        <p className="px-2 text-center text-sm text-cream-100">
          {current.caption || current.alt}
        </p>
        <button type="button" onClick={next} className="btn-ghost !px-4 !py-1.5">
          পরের →
        </button>
      </div>
    </div>
  );
}
