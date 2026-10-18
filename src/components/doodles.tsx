import { cn } from "@/lib/utils";

/**
 * Little hand-drawn-feel decorations. All are `aria-hidden` so screen
 * readers skip them, and they never animate — keeps the page calm.
 */

export function Cloud({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 90"
      className={cn("fill-white/70", className)}
      focusable="false"
    >
      <ellipse cx="60" cy="58" rx="55" ry="26" />
      <ellipse cx="110" cy="48" rx="45" ry="24" />
      <ellipse cx="150" cy="60" rx="40" ry="20" />
    </svg>
  );
}

export function Star({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("fill-blush-200", className)}
      focusable="false"
    >
      <path d="M12 2l2.4 6.2L21 9.3l-4.8 4.3L17.6 20 12 16.7 6.4 20l1.4-6.4L3 9.3l6.6-1.1z" />
    </svg>
  );
}

export function Flower({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      className={cn("fill-blush-200", className)}
      focusable="false"
    >
      <ellipse cx="20" cy="10" rx="5" ry="9" />
      <ellipse cx="20" cy="30" rx="5" ry="9" />
      <ellipse cx="10" cy="20" rx="9" ry="5" />
      <ellipse cx="30" cy="20" rx="9" ry="5" />
      <circle cx="20" cy="20" r="4.5" className="fill-cream-300" />
    </svg>
  );
}
