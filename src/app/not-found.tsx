import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p aria-hidden="true" className="mb-4 text-6xl">
        🌙
      </p>
      <h1 className="mb-3 text-2xl font-semibold">পাতাটি খুঁজে পাওয়া যায়নি</h1>
      <p className="mb-6 text-ink-500">হয়তো লিংকটি ভুল, অথবা পাতাটি সরিয়ে ফেলা হয়েছে।</p>
      <Link href="/" className="btn-primary">
        ← হোমে ফিরে যান
      </Link>
    </div>
  );
}
