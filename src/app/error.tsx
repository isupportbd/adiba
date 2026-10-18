"use client";

/** Top-level error boundary — shows a calm message instead of a crash page. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <p aria-hidden="true" className="mb-4 text-6xl">
        🫧
      </p>
      <h1 className="mb-3 text-2xl font-semibold">একটু সমস্যা হয়েছে</h1>
      <p className="mb-6 text-ink-500">পাতাটি লোড করা যায়নি — আবার চেষ্টা করুন।</p>
      <button type="button" onClick={reset} className="btn-primary">
        আবার চেষ্টা করুন
      </button>
    </div>
  );
}
