"use client";

/** Button that asks "are you sure?" before submitting its parent form. */
export function ConfirmSubmit({
  children,
  confirmText = "মুছে ফেলবেন? এটা ফেরানো যাবে না।",
  className,
}: {
  children: React.ReactNode;
  confirmText?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className ?? "chip border-blush-200 bg-blush-50 text-blush-600 hover:bg-blush-100"}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
