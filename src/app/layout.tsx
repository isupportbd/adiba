import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";
import "./globals.css";

/** Bengali-friendly Google fonts (self-hosted at build time by next/font). */
const body = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const display = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.tagline,
  // 🛡️ Privacy: never let search engines index this family site.
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export const viewport: Viewport = {
  themeColor: "#FDF6EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${body.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:shadow-lift"
        >
          মূল কন্টেন্টে যান
        </a>
        <Providers>
          <SiteHeader />
          <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
